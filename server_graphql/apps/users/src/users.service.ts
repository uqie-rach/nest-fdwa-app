import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { EmailService } from './email/email.service';
import { TokenHelper } from '../utils/tokenHelper';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone_number: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  private saltRounds = 10;

  // Activation token
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 * Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      { user, activationCode },
      {
        expiresIn: '5m',
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      },
    );
    return { token, activationCode };
  }

  // Register user service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const parsedPhoneNumber = parseFloat(phone_number.toString());

    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExist) throw new ConflictException('Email already exist');

    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phone_number: phone_number,
      },
    });

    if (isPhoneNumberExist)
      throw new ConflictException('Phone number already exist');


    const user = {
      name,
      email,
      password: hashedPassword,
      phone_number: parsedPhoneNumber,
    };


    const activationToken: { token: string; activationCode: string } =
      await this.createActivationToken(user);

    const activationCode = activationToken.activationCode;

    await this.emailService.sendMail({
      email,
      subject: 'Account Activation',
      template: './activation-mail',
      name,
      activationCode,
    });


    return { activation_token: activationToken.token, response };
  }

  async userActivation(
    activationDto: {
      activationToken: string;
      activationCode: string;
    },
    response: Response,
  ) {
    const { activationToken, activationCode } = activationDto;

    const newUser: { user: UserData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      });

    if (newUser.activationCode !== activationCode) {
      throw new UnauthorizedException('Invalid activation code');
    }

    const { name, email, password, phone_number } = newUser.user;

    const isExisted = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isExisted) throw new ConflictException('Email already registered!');

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        phone_number,
      },
    });

    return { user, response };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // const { password: userPassword, ...saveUserData } = user;

    if (user && (await this.comparePassword(password, user.password))) {
      const tokenHelper = new TokenHelper(this.configService, this.jwtService);
      return tokenHelper.sendToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password!',
        },
      };
    }
  }

  async comparePassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }

  async getLoggedInUser(req: any) { 
    const user = req.headers['user'];
    const refreshToken = req.headers['refreshtoken'];
    const accessToken = req.headers['accesstoken'];
    
    return { user, refreshToken, accessToken };
  }

  // Get all users service
  async getUsers() {
    return this.prisma.user.findMany();
  }

  async logout(req: any) { 
    req.headers['user'] = null;
    req.headers['accesstoken'] = null;
    req.headers['refreshtoken'] = null;
    
    return { message: 'Logged out successfully!' };
  }
}

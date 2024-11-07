import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  ActivationResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
} from './types/user.types';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { query, Request, Response } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userUservice: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerDto') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new BadRequestException('Please  provide all required fields');
    }

    // If all fields are provided, call the register method from the service
    const { activation_token } = await this.userUservice.register(
      registerDto,
      context.res,
    );

    return { activation_token };
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationDto') activationDto: ActivationDto,
    @Context() Context: { res: Response },
  ): Promise<ActivationResponse> {
    return await this.userUservice.userActivation(activationDto, Context.res);
  }

  @Mutation(() => LoginResponse)
  async Login(@Args('loginDto') loginDto: LoginDto): Promise<LoginResponse> {
    return await this.userUservice.login(loginDto);
  }

  @Query(() => LoginResponse)
  @UseGuards(AuthGuard)
  async GetLoggedInUser(@Context() context: { req: Request }) {
    return await this.userUservice.getLoggedInUser(context.req);
  }

  @Query(() => LogoutResponse)
  async Logout(@Context() context: { req: Request }) {
    return await this.userUservice.logout(context.req);
  }

  @Query(() => [User])
  async getUsers() {
    return this.userUservice.getUsers();
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers['accesstoken'] as string;
    const refreshToken = req.headers['refreshtoken'] as string;

    console.log(refreshToken, accessToken);

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please login to continue');
    }

    if (accessToken) {
      console.log("Access Token found!")
      console.log('[AuthGuard] Checking accessToken... : ', accessToken);
      const decoded = await this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid access token');
      }

      await this.updateAccessToken(req);
    }

    return true;
  }

  async updateAccessToken(req: any): Promise<void> {
    try {
      const refreshToken = req.headers.refreshToken as string;

      if (refreshToken) {
        const decoded = await this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        });

        if (!decoded) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        });

        const { password, ...saveUserData } = user;

        const newRefreshToken = this.jwtService.sign(
          {
            id: user.id,
          },
          {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: '15m',
          },
        );

        const newAccessToken = this.jwtService.sign(
          {
            id: user.id,
          },
          {
            secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: '7d',
          },
        );

        req.refreshToken = newRefreshToken;
        req.accessToken = newAccessToken;
        req.user = saveUserData;
      }
    } catch (error) {
      throw new UnauthorizedException(error?.message);
    }
  }
}

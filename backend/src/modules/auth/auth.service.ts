import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
    });

    return {
      accessToken,
      user: authUser,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: string;
      }>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-jwt-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

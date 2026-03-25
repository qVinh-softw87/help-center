import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Dang nhap va nhan JWT access token' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lay thong tin user hien tai tu access token' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: number; email: string; name: string; role: string }) {
    return user;
  }
}

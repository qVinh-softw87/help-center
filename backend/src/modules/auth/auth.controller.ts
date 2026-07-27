import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';

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

  @ApiOperation({ summary: 'Lam moi JWT access token' })
  @Post('refresh')
  refreshTokens(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dang xuat va xoa refresh token' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: { id: number }) {
    return this.authService.logout(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lay thong tin user hien tai tu access token' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: number; email: string; name: string; role: string }) {
    return user;
  }

  // Admin endpoints for users
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lay danh sach users (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get('admin/users')
  getUsers(@Query() query: GetUsersDto) {
    return this.authService.getUsers(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lay chi tiet user theo id (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('admin/users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tao user moi (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @Post('admin/users')
  createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.authService.createUser(dto, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cap nhat user (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('admin/users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.authService.updateUser(id, dto, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoa/deactivate user (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete('admin/users/:id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.authService.deleteUser(id, user.id);
  }
}

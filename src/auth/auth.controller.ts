import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto)
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus (
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {

    
    return {
      ok: true,
      message: 'Hola Mundo private',
      user,
      rawHeaders,
      headers
    }
  }
  // @SetMetadata('roles',['admin','super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser,ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ){

    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user
    }
  }
}



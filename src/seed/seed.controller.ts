import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from 'src/auth/interfaces';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

 
  @Get()
  @Auth(ValidRoles.admin)
  executeSeed(
    @GetUser() user: User
  ) {
    return this.seedService.runSeed(user);
  }

  


}

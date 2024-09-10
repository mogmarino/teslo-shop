import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData } = createUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save(user)
      delete user.password

      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      }
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  private getJwtToken (payload: JwtPayload) {
    const token = this.jwtService.sign(payload)

    return token
  }

  async login (loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true}
    })

    if(!user)
      throw new UnauthorizedException('Credentials are not valid (email)')
    
    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)')

    return {
      id: user.id,
      email: user.email,
      token: this.getJwtToken({id: user.id})
    }
  }

  async checkAuthStatus (user: User) {
    return {
      /* id: user.id,
      email: user.email,
      fullName: user.fullName, */
      ...user,
      token: this.getJwtToken({id: user.id})
    }
  }

  private handleDBErrors (error: any): never {

    if(error.code === '23505')
      throw new BadRequestException(error.detail)

    console.log(error);
    
    throw new InternalServerErrorException('Please check server logs')
  }

  
}

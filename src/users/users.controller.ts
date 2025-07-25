import { Controller, Get, Body, Put, Param, UseGuards, Req } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUsersService } from './interfaces/iusers-service.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: IUsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.createUser(createUserDto);
  // }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('profile')
  async findLogined(@Req() req: any) {
    return await this.usersService.getUserInformation(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put()
  async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUserInformation(req.user.sub, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   // return this.usersService.delete(+id);
  // }
}

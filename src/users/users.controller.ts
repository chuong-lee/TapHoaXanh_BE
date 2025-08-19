import { Body, Controller, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/updatePassword-user.dto';
import { IUsersService } from './interfaces/iusers-service.interface';

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
  @Get('search')
  async filterAllUser(@Query() userDto: FilterUserDto) {
    return this.usersService.filterAllUser(userDto);
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

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateUserById(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUserInformation(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put('password')
  @ApiResponse({ status: 200, description: 'Cập nhật mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Mật khẩu cũ không đúng hoặc xác nhận mật khẩu không khớp' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  async updatePassword(@Req() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    const result = await this.usersService.updatePassword(req.user.sub, updatePasswordDto);
    return {
      message: 'Cập nhật mật khẩu thành công',
      success: result,
    };
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   // return this.usersService.delete(+id);
  // }
}

import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExist = await this.usersRepository.findOne({where: {email: createUserDto.email}});
    let userInfo = createUserDto;
    userInfo.password = hashSync(userInfo.password, 10);
    if (!userExist) {
      await this.usersRepository.save(userInfo);
      throw new HttpException('Successfully registered user', 201);
    } else {
      throw new HttpException('Already registered user', 406);
    };
  };

  async findAll(): Promise<User[]> {
    throw new HttpException(await this.usersRepository.find(), 200);
  }

  async findOne(email: string): Promise<User> {
    const userExist = await this.usersRepository.findOne({email: email});
    if (userExist) {
      throw new HttpException(userExist, 200);
    } else {
      throw new HttpException("User not found", 406);
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExist = await this.usersRepository.findOne(id);
    if (userExist) {
      let userInfo = updateUserDto;
      if (userInfo.password) userInfo.password = hashSync(userInfo.password, 10);
      this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set(userInfo)
        .where("id = :id", { id })
        .execute();
      throw new HttpException("Updated successfully", 200);
    } else {
      throw new HttpException("User not found", 406);
    }
  }

  async remove(id: string): Promise<void> {
    const userExist = await this.usersRepository.findOne(id);
    if (userExist) {
      this.usersRepository.delete(id);
      throw new HttpException("User deleted successfully", 200);
    } else {
      throw new HttpException("User not found", 406);
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        username,
      })
      .exec();
  }

  createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
    const createdUser = new this.userModel(createUserDto);
    return new Promise<User>((resolve, reject) => {
      createdUser.save((err: any, result) => {
        if (err && err.code === 11000) {
          reject(new BadRequestException('Duplicate username or email'));
        } else {
          resolve(result);
        }
      });
    });
  }
}

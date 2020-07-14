import {Entity, Column, Index, BeforeInsert, OneToMany} from "typeorm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config";
import { Post } from "./Post"
import { IsUserAlreadyExist } from "../utils/validators/decorators/IsUserAlreadyExist";
import { IsEqual } from "../utils/validators/decorators/IsEqual";
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { JwtPayload } from "../types/Jwt";
import { Exclude } from "class-transformer";
import { Comment } from "./Comment";
import Base from "./Base";

@Entity("user")
export class User extends Base{
    @BeforeInsert()
    hashPassword() {
      this.password = bcrypt.hashSync(this.password, 10);
    }
    get token() {
      const payload: JwtPayload = { id: this.id, username: this.username };
      return jwt.sign(payload, config.auth.secretKey, {
        expiresIn: "5d"
      });
    }

    @Column()
    @IsNotEmpty()
    @MinLength(6)
    @Index({unique: true})
    @IsUserAlreadyExist(false, {
      message: "User $value already exists. Choose another name."
    })
    username: string;

    @Column()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    @Exclude()
    password: string;

    @IsNotEmpty()
    @IsEqual("password", { message: "Passwords must match" })
    confirmPassword: string;
    
    // 一个用户有多条 posts
    @OneToMany(() => Post, post => post.user )
    posts: Post[];

    // 一个用户 对应多条评论
    @OneToMany(
      () => Comment,
      comment => comment.user
    )
    comments: Comment[];
}

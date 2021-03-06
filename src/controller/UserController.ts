import { Session } from './../models/Session';
import { Request } from "express";
import {User} from "../entity/User";
import { validate } from "class-validator";
import { throwInputError } from "../utils/throwError";

export class UserController {

    async all(_: Request) {
      const data = await User.find({ relations: ["posts"] });
      return data;
    }

    async login(req: Request) {
      const { username, password } = req.body;
  
      let session = new Session();
      session.username = username;
      session.password = password;
  
      const errors = await validate(session);
  
      if (errors.length > 0) {
        throwInputError(errors, "User login input error");
      }
  
      const user = await User.findOneOrFail({ username });
  
      return { id: user.id, username: user.username, token: user.token };
    }

    async register(req: Request) {
      const { username, password, confirmPassword, email } = req.body;
  
      let user = new User();
      user.username = username;
      user.password = password;
      user.confirmPassword = confirmPassword;
      user.email = email;
  
      const errors = await validate(user);
  
      if (errors.length > 0) {
        throwInputError(errors, "User register input error");
      }
      
      await user.save();
  
      return { id: user.id, username: user.username, token: user.token };
    }

    async one(request: Request) { 
      return User.findOne(request.params.id);
    }

    async save(request: Request) {
        return User.save(request.body);
    }

}
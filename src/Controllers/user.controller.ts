import { compare, hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { User } from "../entity/User";
import Result from "../model/result";
import { UserRepository } from "../Repository/user.repository";
import { JWT, JWTActionType } from "../utils/jwt";

export default class {
  static async getByUserKey(
    ukey: string,
    refreshIndex: number
  ): Promise<User | undefined> {
    const user = await UserRepository.findOneBy({ ukey });
    return user == undefined || refreshIndex != user.refreshIndex
      ? undefined
      : user;
  }

  static async getByEmail(email: string): Promise<User | undefined> {
    console.log("emailsss", email);
    console.log("emaddd", email);
    return await UserRepository.findOneBy({ email });
  }
  static async save(a) {
    return await UserRepository.save(a);
  }
  static async register(
    email: string,
    password: string,
    confirmation: string
  ): Promise<Result<User>> {
    if (password != confirmation) {
      console.log("email", email);
      return new Result<User>(new Error("Passwords do not match"), 400);
    }
    const u = await this.getByEmail(email);
    if (u != undefined) return new Result<User>(new Error("User Exists"), 400);
    try {
      const hpass = await hash(password, 12);
      const user = new User();
      user.email = email;
      user.password = hpass;
      user.refreshIndex = 0;
      user.ukey = uuidv4();
      if (await this.save(user)) return new Result<User>(user, 201);
    } catch (error) {
      console.log(error);
      return new Result<User>(new Error("Registration failed"), 500);
    }
  }
  static async login(email: string, password: string): Promise<Result<any>> {
    const user = await this.getByEmail(email);
    // console.log('u', u)
    if (user == undefined)
      return new Result<User>(new Error("Invalid Credentials"), 400);
    if (!user.confirmed) {
      return new Result<User>(new Error("Confirm Your Registration"), 401);
    }

    try {
      const valid = await compare(password, user.password);

      return valid
        ? new Result(user, 200)
        : new Result(new Error("Invalid credentials"), 400);
    } catch (error) {
      console.log(error);
      return new Result<Error>(new Error("Login failed"), 500);
    }
  }

  static async updateConfirmed(user): Promise<Result<boolean>> {
    if (user.confirmed)
      return new Result<boolean>(new Error("User not confirmed"), 401);
    const success = UserRepository.update({ id: user.id }, { confirmed: true });
    return success
      ? new Result<boolean>(true, 200)
      : new Result<boolean>(new Error("confirmation failed"), 500);
  }

  static async updatePassword(
    user,
    oldPassword: undefined | string,
    newPassword: string
  ): Promise<Result<boolean>> {
    if (oldPassword != undefined && oldPassword == newPassword)
      return new Result<boolean>(new Error("Password has not changed"), 401);
    const hpass = await hash(newPassword, 12);
    console.log('hpass', hpass, user.id)
    const success = UserRepository.update(
      { id: user.id },
      { password: hpass }
      // { password: newPassword }
    );
    return success
      ? new Result<boolean>(true, 200)
      : new Result<boolean>(new Error("Password change failed"), 500);
  }

  static async updateRefreshIndex(user): Promise<Result<boolean>> {
    const success = UserRepository.update(
      { id: user.id },
      { refreshIndex: () => "refresh_index + 1" }
    ); 
    return success
      ? new Result<boolean>(true, 200)
      : new Result<boolean>(new Error("refresh index increment failed"), 500);
  }
}

import { buildSchema } from "graphql";
import accessController from "../Controllers/access.controller";
import userController from "../Controllers/user.controller";
import { handleSendEmailRequest, parseAccessToken, setRefreshTokenCookies, handlePasswordChange } from "./helper";
// import { JWT, JWTActionType } from "../utils/jwt";

export const schema = buildSchema(`
type Query {
    hello: String
    profile: Profile
    resendConfirmation(email: String!): TmpEmailResponse
    forgotPassword(email: String!): TmpEmailResponse
}
type Mutation {
    register(email: String!, password: String!, confirmation: String!): RegisteredUser
    login(email:String!, password: String!): AccessToken
    confirm(email: String!): Boolean
    refresh: AccessToken
    resetPassword(password: String!, confirmation: String!): Boolean
}
type Profile {
    ukey: ID
    email: String
}
type RegisteredUser{
    ukey: ID
    tmp_confirm_token: ID
}
type AccessToken{
    ukey: ID
    access_token: ID
}
type TmpEmailResponse{
  tmp_email_token: ID
}
`);

export const root = {
  hello: () => {
    return "Hello world!";
  },
  register: async (
    {
      email,
      password,
      confirmation,
    }: { email: string; password: string; confirmation: string },
    context: any
  ) => {
    // throw new Error("yes o");

    const result = await userController.register(email, password, confirmation);
    context.res.status(result.status);
    if (result.isError()) {
      throw result.getError();
    }
    const user = result.getObject();
    const confirmToken = accessController.encode(
      user.ukey,
      user.refreshIndex,
      process.env.ACCESS_TYPE_CONFIRM
    );
    if (confirmToken === undefined) {
      context.res.status(500);
      throw new Error("Confirmation failed");
    }
    return {
      ukey: user.ukey,
      tmp_confirm_token: confirmToken,
      confirmToken,
    };
  },

  resendConfirmation: async ({ email }: { email: string }, context: any) => {
    // return {
    //   tmp_mail_token: "kdjd",
    // };
    return await handleSendEmailRequest(email, context.res, true, process.env.ACCESS_TYPE_CONFIRM )
  },

  confirm: async ({ email }: { email: string }, context: any) => {
    let result = parseAccessToken(context.req, accessController.idFromName(process.env.ACCESS_TYPE_CONFIRM));
    if (result.isError()) {
      context.res.status(result.status);
      throw result.getError();
    }
    const claims = result.getObject();
    if (
      claims.act != accessController.idFromName(process.env.ACCESS_TYPE_CONFIRM)
    ) {
      context.res.status(401);
      throw new Error("eNot authorized");
    }
    const user = await userController.getByUserKey(claims.ukey, claims.rti);
    if (user == undefined) {
      context.res.status(404);
      throw new Error("User not found");
    }
    if (email != user.email) {
      context.res.status(401);
      throw new Error("evrNot authorized");
    }
    // if (user.confirmed) {
    //   context.res.status(404);
    //   throw new Error("User already confirmed");
    // }
    // user.confirmed = true;
    // const success = await userController.save(user);
    // if (!success) {
    //   context.res.status(500);
    //   throw new Error("Confirmation failed");
    // }
    result = await userController.updateConfirmed(user);
    context.res.status(200);
    return true;
  },
  login: async (
    { email, password }: { email: string; password: string },
    context: any
  ) => {
    const result = await userController.login(email, password);
    context.res.status(result.status);
    if (result.isError()) {
      throw result.getError();
    }
    const user = result.getObject();
    const accessToken = accessController.encode(
      user.ukey,
      user.refreshIndex,
      process.env.ACCESS_TYPE_USER
    );
    const refreshToken = accessController.encode(
      user.ukey,
      user.refreshIndex,
      process.env.ACCESS_TYPE_REFRESH
    );
    if (accessToken == undefined || refreshToken == undefined) {
      context.res.status(500);
      throw new Error("Login failed");
    }
    context.res.status(result.status);
    setRefreshTokenCookies(context.res, refreshToken);
    return { ukey: user.ukey, access_token: accessToken };
  },
  profile: async ({}: {}, context: any) => {
    const result = parseAccessToken(context.req, accessController.idFromName(process.env.ACCESS_TYPE_USER));
    if (result.isError()) {
      context.res.status(result.status);
      throw result.getError();
    }
    const claims = result.getObject();
    const user = await userController.getByUserKey(claims.ukey, claims.rti);
    if (user == undefined) {
      context.res.status(404);
      throw new Error("User not found");
    }
    return user;
  },
  refresh: async ({}: {}, context: any) => {
    const token = context.req.cookies[process.env.REFRESH_TOKEN_NAME];
    context.res.status(401);
    if (token == undefined) {
      throw new Error("Not authorized");
    }
    const claims = accessController.decode(
      token,
      accessController.idFromName(process.env.ACCESS_TYPE_REFRESH)
    );
    if (claims == undefined) {
      // context.res.status(404);
      throw new Error("User claims not found");
    }
    const user = await userController.getByUserKey(claims.ukey, claims.rti);
    // UserRepository.update({id: 1}, {confirmed: true})
    if (user == undefined) {
      // context.res.status(404);
      throw new Error("User user not found");
    }
    if (user.refreshIndex != claims.rti) {
      // context.res.status(404);

      throw new Error("User ref not found");
    }
    // user.refreshIndex = user.refreshIndex + 1;
    // // UserRepository.findByName
    // const success = await userController.save(user);
    // if (!success) {
    //   context.res.status(401);
    //   throw new Error("Refresh Failed");
    // }
    const result = await userController.updateRefreshIndex(user);
    if (result.isError()) {
      context.res.status(result.status);
      throw result.getError();
    }
    user.refreshIndex = user.refreshIndex + 1;

    context.res.status(200);
    const refreshToken = accessController.encode(
      user.ukey,
      user.refreshIndex,
      process.env.ACCESS_TYPE_REFRESH
    );
    const accessToken = accessController.encode(
      user.ukey,
      user.refreshIndex,
      process.env.ACCESS_TYPE_USER
    );

    if (refreshToken == undefined || accessToken == undefined) {
      context.res.status(500);
      throw new Error("Refresh failed");
    }
    setRefreshTokenCookies(context.res, refreshToken);
    context.res.status(200);
    return {
      ukey: user.ukey,
      access_token: accessToken,
    };
  },
  forgotPassword: async ({ email }: { email: string }, context: any) => {
    // return {
    //   tmp_mail_token: "kdjd",
    // };
    return await handleSendEmailRequest(email, context.res, false, process.env.ACCESS_TYPE_FORGOT_PASSWORD )
  },
  resetPassword: async ({ password, confirmation }: { password: string, confirmation: string  }, context: any) => {
    const accessId = accessController.idFromName(process.env.ACCESS_TYPE_FORGOT_PASSWORD)
    return await handlePasswordChange(undefined, password, confirmation, context.req, context.res, accessId)
  },

};

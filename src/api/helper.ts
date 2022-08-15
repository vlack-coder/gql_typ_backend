import { Request, Response } from "express";
import Result from "../model/result";
import accessController from "../Controllers/access.controller";
import userController from "../Controllers/user.controller";
import Mailer from "../utils/mailer";

export function parseAccessToken(req: Request, accessId: number): Result<any> {
  const authHeader = req.headers["authorization"];
  // console.log('authHeader', authHeader)
  if (authHeader == undefined)
    return new Result(new Error("Not authorized"), 401);

  // format bearer token
  const a = authHeader.split(" ");
  //   console.log('a', a)
  if (a.length != 2) return new Result(new Error("Not authorized"), 401);

  const token = a[1];
  const claims = accessController.decode(token, accessId);
  if (claims == undefined) return new Result(new Error("Not authorized"), 401);

  return new Result(claims, 200);
}

export function setRefreshTokenCookies(res: Response, token: string) {
  const refreshExpiration = accessController.refreshExpiration();
  res.cookie(process.env.REFRESH_TOKEN_NAME, token, {
    domain: process.env.REFRESH_TOKEN_DOMAIN,
    secure: process.env.REFRESH_TOKEN_SECURE == "true",
    httpOnly: process.env.REFRESH_TOKEN_HTTPONLY == "true",
    expires: refreshExpiration,
    maxAge: refreshExpiration.getTime(),
  });
}

export async function handleSendEmailRequest(
  email: string,
  res: Response,
  isConfirmation: boolean,
  accessName
) {
  const user = await userController.getByEmail(email);
  if (!user) {
    res.status(404);
    throw Error("user not found!");
  }
  if (isConfirmation && user.confirmed) {
    res.status(401);
    throw Error("Account confirmed already🙄");
  }

  const accessToken = accessController.encode(
    user.ukey,
    user.refreshIndex,
    accessName
  );
  if (!accessToken) {
    res.status(404);
    throw Error("fack ya bitch");
  }
  //   isConfirmation
  //     ? Mailer.sendConfirmation(email, accessToken)
  //     : Mailer.forgotPassword(email, accessToken);
  const success = await (isConfirmation
    ? Mailer.sendConfirmation(user.email, accessToken)
    : Mailer.sendForgotPassword(user.email, accessToken));
  if (!success) {
    res.status(500);
    throw Error("Server error");
  }
  res.status(200);
  return true;
}

export async function handlePasswordChange(
  oldPassword: string | undefined,
  newPassword: string,
  confirmation,
  req: Request,
  res: Response,
  accessId: number
): Promise<boolean> {
  console.log("newPassword", newPassword, confirmation, accessId);
  if (newPassword != confirmation) {
    res.status(500);
    console.log("yes");

    throw new Error("Passwords don't match");
  } 
  console.log("mo");

  let result = parseAccessToken(req, accessId);
  //   console.log('result', result)
  if (result.isError()) {
    res.status(result.status);
    throw new Error("Link has expired, send confirmation link again");
  }
  //   console.log('result', result)

  const claims = result.getObject();
  if (claims.act != accessId) {
    res.status(result.status);
    throw new Error("Not authorized");
  }
  console.log("claims", claims);
  const user = await userController.getByUserKey(claims.ukey, claims.rti);
  console.log("user", user);
  if (!user) {
    res.status(result.status);
    throw new Error("Not authorized");
  }

  result = await userController.updatePassword(user, oldPassword, newPassword);
  console.log("result", result);
  res.status(result.status);
  if (result.isError()) {
    res.status(result.status);
    throw result.getError();
  }
  return result.getObject();
}

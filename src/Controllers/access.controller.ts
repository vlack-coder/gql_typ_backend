import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Access } from "../entity/Access";
import Result from "../model/result";
import { AccessRepository } from "../Repository/access.repository";
import { UserRepository } from "../Repository/user.repository";
import { JWT, JWTActionType } from "../utils/jwt";

const accessIds: number[] = [];
const accessNames: string[] = [];
const accessItems: Access[] = [];

export default class {
  static async load() {
    if (accessItems.length > 0) {
      return;
    }
    const rows = await AccessRepository.find();
    if (rows == undefined) {
      return;
    }
    // console.log('rows', rows)
    rows.forEach((x) => {
      accessIds.push(x.id);
      accessNames.push(x.name);
      accessItems.push(x);
    });
    console.log('acc', accessIds, accessNames, accessItems)
  }

  static encode(
    ukey: string,
    refreshIndex: number,
    accessName: string
  ): string | undefined {
    if (!accessNames.includes(accessName)) return undefined;

    const position = accessNames.indexOf(accessName);
    const accessItem = accessItems[position];

    try {
      const claims = {
        iss: process.env.JWT_ISSUER,
        ukey: ukey,
        act: accessItem.id,
        rti: refreshIndex,
      };
      const token = sign(claims, accessItem.signature, {
        expiresIn: this.expiresIn(accessItem),
      });
      return token;
    } catch (error) {
      console.log("err", error);
    }
  }

  static decode(token: string, accessId: number): any | undefined {
    if (!accessIds.includes(accessId)) return undefined;
    const position = accessIds.indexOf(accessId);
    const accessItem = accessItems[position];

    try {
      const claims = verify(token, accessItem.signature);

      return claims;
    } catch (error) {
      console.log("err", error);
      return undefined;
    }
  }

  static refreshExpiration() {
    if(!accessNames.includes(process.env.ACCESS_TYPE_REFRESH))
    throw new Error("Access name not in db"
    )
    const position = accessNames.indexOf(process.env.ACCESS_TYPE_REFRESH);
    const accessItem = accessItems[position];
    const d = new Date();
    d.setDate(
      d.getDate() + accessItem.duration
    );
    return d;
  }

  static idFromName(name: string): number {
    if(!accessNames.includes(name)){
      throw new Error("Access name not in db"
      )
    }
    const position = accessNames.indexOf(name);
    return accessIds[position]

  }

  static expiresIn(a) {
    return `${a.duration}${a.durationUnit}`;
  }
}

// export class JWT {
//     static encode(
//       ukey: string,
//       refreshIndex: number,
//       actionType: number
//     ): string | undefined {
//       const action = new JWTAction(actionType);
//       if (action.invalid()) {
//         return undefined;
//       }
//       try {
//         const claims = {
//           iss: process.env.JWT_ISSUER,
//           ukey: ukey,
//           act: action.type,
//           rti: refreshIndex,
//         };
//         const token = sign(claims, action.secret, {
//           expiresIn: action.expiresIm,
//         });
//         return token;
//       } catch (error) {
//         console.log("err", error);
//       }
//     }

//     static decode(token: string, actionTypes: number): any | undefined {
//       const action = new JWTAction(actionTypes);
//       if (action.invalid()) return undefined;
//       try {
//         const claims = verify(token, action.secret);
//         return claims;
//       } catch (error) {
//         return undefined;
//       }
//     }
//     static refreshExpiration() {
//       const d = new Date();
//       d.setDate(
//         d.getDate() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS)
//       );
//       return d;
//     }
//   }

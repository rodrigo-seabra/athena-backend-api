// import { json, Request, Response } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { UsersInterface } from "../interfaces/User.interface";
// import User, {UsersModel} from "../models/User";

// interface JwtPayloadWithCPF extends JwtPayload {
//   cpf: string;
// }

// class Token {
//   public async createUserToken(
//     user: UsersInterface,
//     res: Response
//   ): Promise<Response> {
//     const token = jwt.sign(
//       {
//         name: user.name,
//         cpf: user.cpf,
//       },
//       "athena-secret"
//     );
//     return res.json({
//       message: "Você está autenticado!",
//       token: token,
//       userCPF: user.cpf,
//     });
//   }
//   public check(token: string): boolean {
//     try {
//       let decoded = jwt.verify(token, "athena-secret");
//       if (decoded) {
//         return true;
//       } else {
//         return false;
//       }
//     } catch (err) {
//       return false;
//     }
//   }



// }
// export default new Token();
import { NextFunction, Request, Response } from "express";
import Token from "../helpers/Token";

import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";

class Middlewares {

  public async authMiddleware(req: Request, res: Response, next: NextFunction) {
    let token = Token.getToken(req);
    if (token == "Sem credenciais") {
      return res.status(401).json({ message: "Acesso negado!" });
    }
    let authToken = await Token.check(token);
    if (authToken) {
      next();
    } else {
      return res.status(400).json({ message: "Token inválido!" });
    }
  }
}

export default new Middlewares();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
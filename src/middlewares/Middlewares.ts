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
    // let authToken = await Token.check(token);
    // if (authToken) {
    //   next();
    // } else {
    //   return res.status(400).json({ message: "Token inválido!" });
    // }
    let userFunction = await Token.getUserFunction(token);
    
  }

  public async authTaskCreationMiddleware(req: Request, res: Response, next: NextFunction) {
    let token = Token.getToken(req);
    if (token === "Sem credenciais") {
      return res.status(401).json({ message: "Acesso negado!" });
    }
    try {
      let userFunction = await Token.getUserFunction(token); 
      if (userFunction === 'professor' || userFunction === 'coordenador' || userFunction === 'diretor') {
        console.log(userFunction)
        next(); 
      } else {
        return res.status(403).json({ message: "Acesso negado! Somente professores, coordenadores e diretores podem criar tarefas." });
      }
    } catch (error) {
      return res.status(400).json({ message: "Token inválido!" });
    }
  }
}

export default new Middlewares();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
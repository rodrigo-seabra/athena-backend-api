import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UsersModel } from "../models/User";
import TokenHelper from "../helpers/TokenHelper";
import { UsersInterface } from "../interfaces/User.interface";

interface JwtPayloadWithCPF extends JwtPayload {
  cpf: string | undefined;
}

class AuthMiddlware {
  public async teacherAuth(req: Request, res: Response, next: NextFunction) : Promise<void | Response>
  {
    try {
      const tokenValidationResult = await TokenHelper.validateToken(req);

      if (tokenValidationResult !== true) {
        return res.status(403).json({ message: "Acesso negado!" });
      }

      const role = TokenHelper.Role;
      if (!role) {
        return res.status(403).json({ message: "Usuário não encontrado!" });
      }

      const path = req.path;
      if( role !== "professor")
      {
        return res.status(403).json({ message: "Acesso negado!" });
      }

    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }

    next();
  }

  public async BasicAuth(req: Request, res: Response, next: NextFunction) : Promise<void | Response>
  {
    try {
      const tokenValidationResult = await TokenHelper.validateToken(req);

      if (tokenValidationResult !== true) {
        return res.status(403).json({ message: "Acesso negado!" });
      }

      const role = TokenHelper.Role;
      if (!role) {
        return res.status(403).json({ message: "Usuário não encontrado!" });
      }

    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }

    next();
  }

  public async Authorization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const tokenValidationResult = await TokenHelper.validateToken(req);

      if (tokenValidationResult !== true) {
        return res.status(403).json({ message: "Acesso negado!" });
      }

      const role = TokenHelper.Role;
      if (!role) {
        return res.status(403).json({ message: "Usuário não encontrado!" });
      }

      const path = req.path;

      if (
        path.includes("/tasks/create") &&
        !["professor", "coordenador", "diretor"].includes(role)
      ) {
        return res.status(403).json({ message: "Acesso negado!" });
      }

      if (
        path.includes("/tasks/correction") &&
        !["professor", "coordenador", "diretor"].includes(role)
      ) {
        return res.status(403).json({ message: "Acesso negado!" });
      }

      if (path.includes("/tasks/response") && role !== "estudante") {
        return res.status(403).json({ message: "Acesso negado!" });
      }
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }

    next();
  }
  public async schoolAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const tokenValidationResult = await TokenHelper.validateTokenSchool(req);

      if (tokenValidationResult !== true) {
        return res.status(403).json({ message: "Acesso negado!" });
      }
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }

    next();
  }
}

export default new AuthMiddlware();

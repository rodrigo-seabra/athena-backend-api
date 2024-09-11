import { json, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UsersInterface } from "../interfaces/User.interface";
import User, {UsersModel} from "../models/User";

interface JwtPayloadWithCPF extends JwtPayload {
  CPF: string;
}

class Token {
  public async createUserToken(
    user: UsersInterface,
    res: Response
  ): Promise<Response> {
    const token = jwt.sign(
      {
        name: user.name,
        cpf: user.cpf,
      },
      "athena-secret"
    );
    // return token
    return res.json({
      message: "Você está autenticado!",
      token: token,
      userCPF: user.cpf,
    });
  }
  public check(token: string): boolean {
    try {
      let decoded = jwt.verify(token, "010806Catalogo");
      if (decoded) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
  public getToken(req: Request): string {
    let error = "Sem credenciais";
    if (!req.headers.authorization) {
      return error;
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      return token;
    } else {
      return error;
    }
  }

  public async getUser(req: Request, res: Response): Promise<any> {
    let token = this.getToken(req);
    if (!token) {
      return res.status(401).json({ message: "Acesso negado!" });
    }
    try {
      const decoded = jwt.verify(token, "010806Catalogo") as JwtPayloadWithCPF;
      const cpf = decoded.cpf;
      const user: UsersModel | null = await User.findOne({ cpf: cpf });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }
      return user;
    } catch (error) {
      return res.status(400).json({ message: "Token inválido!" });
    }
  }
}
export default new Token();
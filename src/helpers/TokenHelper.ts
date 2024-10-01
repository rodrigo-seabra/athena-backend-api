import {Request, Response} from "express";
import { UsersInterface } from "../interfaces/User.interface";
import { Error } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, {UsersModel} from "../models/User";
import { SchoolInterface } from "../interfaces/School.interface";
import School, { SchoolsModels } from "../models/School";


interface JwtPayloadWithCPF extends JwtPayload {
    cpf: string;
  }

class TokenHelper{
    private readonly secret = "athena-secret";
    public User!: UsersModel | null;
    public Role!: string | undefined;
    public School !: SchoolsModels | null;

    private getToken(req: Request): string | null {
        const authHeader = req.headers["authorization"];
        return authHeader ? authHeader.split(" ")[1] : null;
    }
    
    public async createUserToken(user: UsersInterface, res: Response): Promise<Response> {
        const token = jwt.sign(
            {
                name: user.name,
                cpf: user.cpf,
            },
            this.secret,
            { expiresIn: '36h' } 
        );

        return res.status(200).json({
            message: "Você está autenticado!",
            token: token,
            cpf: user.cpf,
            role: user.role,
        });
        
    }
    public async createSchoolToken(school: SchoolInterface, res: Response): Promise<Response> {
      const token = jwt.sign(
          {
              name: school.name,
              cnpj: school.cnpj,
          },
          this.secret,
          { expiresIn: '36h' } 
      );

      return res.status(200).json({
          message: "Você está autenticado!",
          token: token,
          cnpj: school.cnpj,
          name: school.name,
      });
      
  }
    public async validateToken(req: Request): Promise<boolean> {
        const token = this.getToken(req);
    
        if (!token) {
            throw new Error("Acesso negado");
        }
    
        try {
          await this.getUserByToken(token);
          return true;
        } catch {
          return false;
        }
      }

      public async validateTokenSchool(req: Request): Promise<boolean> {
        const token = this.getToken(req);
    
        if (!token) {
            throw new Error("Acesso negado");
        }
    
        try {
          await this.getSchoolByToken(token);
          return true;
        } catch {
          return false;
        }
      }
    
      private async getUserByToken(token: string): Promise<void> {
        try {
          const decoded = jwt.verify(token, this.secret) as JwtPayloadWithCPF;
          const user = await User.findOne({ cpf: decoded.cpf });
    
          if (user) {
            this.User = user;
            this.Role = user.role;
          } else {
            throw new Error("Usuário não encontrado");
          }
        } catch {
          throw new Error("Token inválido");
        }
      }

      private async getSchoolByToken(token: string): Promise<void> {
        try {
          const decoded = jwt.verify(token, this.secret) as JwtPayloadWithCPF;
          const school = await School.findOne({ cnpj: decoded.cnpj });
    
          if (school) {
            this.School = school;
          } else {
            throw new Error("Escola não encontrada");
          }
        } catch {
          throw new Error("Token inválido");
        }
      }

    
}

export default new TokenHelper();
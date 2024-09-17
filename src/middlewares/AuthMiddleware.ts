import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UsersModel } from "../models/User";

interface JwtPayloadWithCPF extends JwtPayload {
    cpf: string | undefined;
}

class AuthMiddlware {
    
    user!: UsersModel | null;

    public async Authenticator(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.headers.authorization) {
                throw new Error("Não autorizado");
            }
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
            if (!token) {
                throw new Error("Não autorizado");
            }
            const decoded = jwt.verify(token, "athena-secret") as JwtPayloadWithCPF;
            const cpf = decoded.cpf;
            const userFind: UsersModel | null = await User.findOne({ cpf: cpf });
        } catch (err: any) {
            return res.status(401).json({ message: err.message });
        }
        next();
    } 

    public async getRole(req: Request, res: Response, next: NextFunction) 
    {
    
        next();
    }
}

export default new AuthMiddlware();
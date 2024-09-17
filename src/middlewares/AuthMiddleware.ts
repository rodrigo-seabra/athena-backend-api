import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UsersModel } from "../models/User";
import { Req } from "../interfaces/Req.interface";

interface JwtPayloadWithCPF extends JwtPayload {
    cpf: string | undefined;
}



class AuthMiddlware {
    
    // user!: UsersModel | null;

    public async Authenticator(req: Req, res: Response, next: NextFunction) {
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
            if( !userFind )
            {
                throw new Error("User not found")
            }
            req.user = userFind;
        } catch (err: any) {
            return res.status(401).json({ message: err.message });
        }
        next();
    } 

    public async Authorization(req: Req, res: Response, next: NextFunction) 
    {
        const{
            role
        } = req.user as UsersModel;
        console.log(role);
        const path = req.path;

        if (!role) {
            return res.status(403).json({ message: 'Acesso negado!' });
        }
        
        if (path.includes('/taks') && !['professor', 'coordenador', 'diretor'].includes(role)) {
            return res.status(403).json({ message: 'Acesso negado!' });
        }

        if (path.includes('/class') && !['coordenador', 'diretor'].includes(role)) {
            return res.status(403).json({ message: 'Acesso negado!' });
        }

        if (path.includes('/taks/response') && role !== 'estudante') {
            return res.status(403).json({ message: 'Acesso negado!' });
        }

        next();
    }
}

export default new AuthMiddlware();
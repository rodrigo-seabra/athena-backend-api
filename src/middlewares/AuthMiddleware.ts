import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UsersModel } from "../models/User";
import TokenHelper from "../helpers/TokenHelper";
import { UsersInterface } from "../interfaces/User.interface";

interface JwtPayloadWithCPF extends JwtPayload {
    cpf: string | undefined;
}

class AuthMiddlware {

    public async Authorization(req: Request, res: Response, next: NextFunction) 
    {
        try {
            const tokenValidationResult = await TokenHelper.validateToken(req);
            
            if (tokenValidationResult !== true) {
                return res.status(403).json({ message: 'Acesso negado!' });
            }

            const role = TokenHelper.Role;
            if (!role) {
                return res.status(403).json({ message: 'Usuário não encontrado!' });
            }

            const path = req.path;


            if (path.includes('/taks/create') && !['professor', 'coordenador', 'diretor'].includes(role)) {
                return res.status(403).json({ message: 'Acesso negado!' });
            }
            
            if (path.includes('/taks/correction') && !['professor', 'coordenador', 'diretor'].includes(role)) {
                return res.status(403).json({ message: 'Acesso negado!' });
            }

            if (path.includes('/class') && !['coordenador', 'diretor'].includes(role)) {
                return res.status(403).json({ message: 'Acesso negado!' });
            }
    
            if (path.includes('/taks/response') && role !== 'estudante') {
                return res.status(403).json({ message: 'Acesso negado!' });
            }
    
        } catch( err: any ) {
            return res.status( 401 ).json( { message: err.message } );
        }
        
        next();
    }
}

export default new AuthMiddlware();
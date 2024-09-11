import { json, Request, Response } from "express";
import User, {UsersModel} from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Token from "../helpers/Token";

const saltRounds = 10;
const jwtSecret = "athena-secret"; 
class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({message: "Deu bom!"})
  }
  public async create(req: Request, res: Response) : Promise<Response>{
    try {
      const { name, email, password, phone, cpf, role, address, schoolId } = req.body;

      if (!name || !email || !password || !phone || !cpf || !role || !address || !schoolId) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está cadastrado." });
      }
      const existingUserCPF = await User.findOne({ cpf });
      if (existingUserCPF) {
        return res.status(400).json({ message: "Este email já está cadastrado." });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser: UsersModel = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
        role,
        address,
        schoolId,
      });

      let created = await User.create(newUser);
      return await Token.createUserToken(created, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  }

}

export default new UserController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
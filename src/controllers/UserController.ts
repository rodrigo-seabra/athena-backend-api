import { json, Request, Response } from "express";
import User, {UsersModel} from "../models/User";
import bcrypt from "bcrypt";
import TokenHelper from "../helpers/TokenHelper";

const saltRounds = 10;
class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({message: "Deu bom!"})
  }
  public async create(req: Request, res: Response) : Promise<Response>{
    try {
      const { name, email, password, phone, cpf, role, address, IdSchool } = req.body;

      if (!name || !email || !password || !phone || !cpf || !role || !address || !IdSchool) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }

      const existingUser = await User.findOne({ email });
      console.log(existingUser)
      if (existingUser && existingUser != null ) {
        return res.status(400).json({ message: "Este email já está cadastrado." });
      }
      const existingUserCPF = await User.findOne({ cpf });
      if (existingUserCPF) {
        return res.status(400).json({ message: "Este cpf já está cadastrado." });
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
        IdSchool,
      });

      let created = await User.create(newUser);
      return await TokenHelper.createUserToken(created, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as UsersModel;
    let userFind: UsersModel | null = await User.findOne({ email: email });
    if (userFind) {
      if (!email) {
        return res.status(422).json({ message: "O email é obrigatório!" });
      }
      if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória!" });
      }
      const checkPassword = await bcrypt.compare(password, userFind.password);
      if (!checkPassword) {
        return res.status(422).json({
          message: "Senha inválida",
        });
      }
      return await TokenHelper.createUserToken(userFind, res);
    } else {
      return res.status(422).json({
        message: "Não há usuário cadastrado com esse e-mail",
      });
    }
  }

}

export default new UserController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
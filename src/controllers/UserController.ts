import { json, Request, Response } from "express";
import User, {UsersModel} from "../models/User";


class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    // let cpf = req.params;
    // let user: UsersModel | null = await User.findOne({ cpf: cpf });
    // if (!user) {
    //   return res.status(404).json({ message: "Usuário não encontrado!" });
    // } else {
    //   return res.status(200).json({ user });
    // }
    return res.status(200).json({message: "Deu bom!"})
  }

}

export default new UserController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
import { json, Request, Response } from "express";
import User, { UsersModel } from "../models/User";
import bcrypt from "bcrypt";
import TokenHelper from "../helpers/TokenHelper";
import School from "../models/School";
import Class from "../models/Class";
import mongoose from "mongoose";

const saltRounds = 10;

class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    let user = TokenHelper.User;
    console.log("Usuário encontrado:", user);
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }
    return res.status(200).send({ message: user });
  }

  public async userFunction(req: Request, res: Response): Promise<Response> {
    const token = req.body;
    let functionUser = TokenHelper.Role;
    console.log("Função do usuário:", functionUser);
    if (!functionUser) {
      return res.status(404).send({ message: "Função nao encontrada" });
    }
    return res.status(200).send({ message: functionUser });
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        email,
        password,
        phone,
        cpf,
        role,
        address,
        IdSchool,
        IdClass,
      } = req.body;

      console.log("Dados recebidos:", req.body);

      if (!name || !email || !password || !phone || !cpf || !role || !address) {
        console.log("Erro: Campos obrigatórios ausentes");
        return res
          .status(400)
          .json({ message: "Todos os campos são obrigatórios." });
      }

      console.log("Validando o papel do usuário:", role);
      if (
        role !== "diretor" &&
        role !== "professor" &&
        role !== "estudante" &&
        role !== "coordenador" &&
        role !== "inspetor" &&
        role !== "limpeza" &&
        role !== "cozinha" &&
        role !== "outro"
      ) {
        console.log("Erro: Papel inválido");
        return res.status(400).json({ message: "Role inválida." });
      }
      const classEntity = await Class.findById(IdClass);
      const school = await School.findById(IdSchool);


      if (!school) {
        console.log("Erro: ID da escola inválido.");
        return res.status(400).json({ message: "ID da escola inválido." });

      }
      if (role == "estudante" && !classEntity) {
        console.log("Turma inválida 2");
        return res.status(400).json({ message: "ID da turma inválido." });

      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Erro: Este email já está cadastrado.");
        return res
          .status(400)
          .json({ message: "Este email já está cadastrado." });
      }

      const existingUserCPF = await User.findOne({ cpf });
      if (existingUserCPF) {
        console.log("Erro: Este CPF já está cadastrado.");
        return res
          .status(400)
          .json({ message: "Este CPF já está cadastrado." });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("Senha hasheada com sucesso.");

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
        role,
        address: {
          street: address.street,
          cep: address.cep,
          state: address.state,
          city: address.city,
        },
        IdSchool: "",
        IdClass: "",
        approved: false,
      });

      console.log("Novo usuário criado:", newUser);

      const createdUser: UsersModel | undefined | null = await User.create(
        newUser
      );
      console.log("Usuário criado com sucesso:", createdUser);

      if (createdUser && createdUser._id) {
        const userId = createdUser._id.toString();
        console.log("ID do usuário criado:", userId);

        if (school) {
          school.pendingRequests.push(userId);
          await school.save();
          console.log("Escola atualizada com o ID do usuário:", school);
        } else {
          console.log("Erro: Escola não encontrada.");
          return res.status(404).json({ message: "Escola não encontrada." });
        }
        if (createdUser.role === "estudante") {
          if (classEntity) {
            classEntity.pendingRequests = classEntity.pendingRequests || [];
            classEntity.pendingRequests.push(userId);
            await classEntity.save();
            console.log("Turma atualizada com o ID do usuário:", classEntity);
          } else {
            console.log("Erro: Turma não encontrada.");
            return res.status(404).json({ message: "Turma não encontrada." });
          }
        }

      }

      console.log("Gerando token para o usuário criado.");
      return await TokenHelper.createUserToken(createdUser, res);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as UsersModel;
    let userFind: UsersModel | null = await User.findOne({ email: email });
    if (userFind) {
      console.log("Usuário encontrado para login:", userFind);
      if (!email) {
        return res.status(422).json({ message: "O email é obrigatório!" });
      }
      if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória!" });
      }
      const checkPassword = await bcrypt.compare(password, userFind.password);
      if (!checkPassword) {
        console.log("Erro: Senha inválida");
        return res.status(422).json({ message: "Senha inválida" });
      }
      return await TokenHelper.createUserToken(userFind, res);
    } else {
      console.log("Erro: Não há usuário cadastrado com esse e-mail");
      return res
        .status(422)
        .json({ message: "Não há usuário cadastrado com esse e-mail" });
    }
  }

  public async approveUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, IdSchool, IdClass } = req.body;
      console.log("Aprovando usuário:", userId);

      const user = await User.findById(userId);
      if (!user) {
        console.log("Erro: Usuário não encontrado.");
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const school = await School.findById(IdSchool);
      if (!school) {
        console.log("Erro: Escola não encontrada.");
        return res.status(404).json({ message: "Escola não encontrada." });
      }

      school.pendingRequests = school.pendingRequests.filter(
        (request) => request !== userId
      );
      await school.save();

      if (user.role === "estudante") {
        const turma = await Class.findById(IdClass);
        if (!turma) {
          console.log("Erro: Turma não encontrada.");
          return res.status(404).json({ message: "Turma não encontrada." });
        }

        turma.pendingRequests = turma.pendingRequests?.filter(
          (request) => request !== userId
        );
        if (!turma.students) {
          turma.students = [];
        }
        turma.students.push(userId);

        await turma.save();
      }

      user.approved = true;
      user.IdSchool = IdSchool;
      user.IdClass = user.role === "estudante" ? IdClass : "";
      await user.save();

      console.log("Usuário aprovado com sucesso:", user);
      return res
        .status(200)
        .json({ message: "Usuário aprovado com sucesso.", user: user });
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      return res.status(500).json({ message: "Erro ao aprovar usuário." });
    }
  }

  public async rejectUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, IdSchool } = req.body;
      console.log("Rejeitando usuário:", userId);

      const user = await User.findById(userId);
      if (!user) {
        console.log("Erro: Usuário não encontrado.");
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const school = await School.findById(IdSchool);
      if (!school) {
        console.log("Erro: Escola não encontrada.");
        return res.status(404).json({ message: "Escola não encontrada." });
      }

      school.pendingRequests = school.pendingRequests.filter(
        (request) => request !== userId
      );
      await school.save();

      await User.findByIdAndDelete(userId);
      console.log("Usuário rejeitado e removido com sucesso.");

      return res.status(200).json({
        message: "Solicitação do usuário rejeitada e usuário removido.",
      });
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
      return res.status(500).json({ message: "Erro ao rejeitar usuário." });
    }
  }
}

export default new UserController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}

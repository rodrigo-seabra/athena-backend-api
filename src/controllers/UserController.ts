import { json, Request, Response } from "express";
import User, { UsersModel } from "../models/User";
import bcrypt from "bcrypt";
import TokenHelper from "../helpers/TokenHelper";
import School from "../models/School";
import Class from "../models/Class";
import mongoose from "mongoose";
import * as faceapi from "face-api.js";

const saltRounds = 10;

class UserController {

  public async loginWithFaceDescriptor(req: Request, res: Response): Promise<Response | any> {
    const { descriptor } = req.body;
    const SIMILARITY_THRESHOLD = 0.6; // Ajuste este valor para a credibilidade necessária

    // Verifica se o descritor foi fornecido
    if (!descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ message: "Descriptor facial é obrigatório e deve ser um array." });
    }

    try {
        const allUsers = await User.find(); // Obtém todos os usuários

        for (const user of allUsers) {
            if (!user.image) continue; // Ignora usuários sem descriptor facial

            const userDescriptor: number[] = JSON.parse(user.image); // Converte o descriptor salvo para um array de números

            // Verifica se o userDescriptor é um array válido
            if (!Array.isArray(userDescriptor)) {
                console.warn(`User ${user.id} has an invalid descriptor.`);
                continue;
            }

            // Calcula a distância euclidiana entre os descritores
            const distance = faceapi.euclideanDistance(descriptor, userDescriptor);

            // Compara a distância com o limiar de similaridade
            if (distance < SIMILARITY_THRESHOLD) {
                const token = TokenHelper.createUserToken(user, res); // Gera o token de autenticação

                // Envia a resposta e finaliza o método
                return res.status(200).json({
                    message: "Login bem-sucedido.",
                    token
                });
            }
        }

        // Se nenhum usuário correspondente for encontrado
        return res.status(401).json({
            message: "Falha no reconhecimento facial. Tente novamente.",
            similarityScore: null // Pode-se adicionar uma lógica para calcular e retornar a similaridade média, se necessário
        });

    } catch (error) {
        console.error("Erro ao fazer login com reconhecimento facial:", error);
        // Evita múltiplas respostas ao capturar o erro e finalizar o método
        if (!res.headersSent) {
            return res.status(500).json({ message: "Erro ao processar o login com reconhecimento facial." });
        }
    }
}


  public async updateFaceDescriptor(req: Request, res: Response): Promise<Response> {
    const { descriptor } = req.body;
    const userId = TokenHelper.User?._id;
  
    if (!descriptor) {
      return res.status(400).json({ message: "Descriptor facial é obrigatório." });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
  
      // Convertendo o array de descritores em string JSON para armazenamento
      user.image = JSON.stringify(descriptor);
      await user.save();
  
      return res.status(200).json({ message: "Descriptor facial atualizado com sucesso.", user });
    } catch (error) {
      console.error("Erro ao atualizar descriptor facial:", error);
      return res.status(500).json({ message: "Erro ao atualizar descriptor facial." });
    }
  }
  

  public async index(req: Request, res: Response): Promise<Response> {
    let user = TokenHelper.User;
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }
    return res.status(200).send({ message: user });
  }

  public async userFunction(req: Request, res: Response): Promise<Response> {
    const token = req.body;
    let functionUser = TokenHelper.Role;
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
        image,
        address,
        IdSchool,
        IdClass,
      } = req.body;


      if (!name || !email || !password || !phone || !cpf || !role || !address) {
        return res
          .status(400)
          .json({ message: "Todos os campos são obrigatórios." });
      }

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
        return res.status(400).json({ message: "Role inválida." });
      }
      const classEntity = await Class.findById(IdClass);
      const school = await School.findById(IdSchool);


      if (!school) {
        return res.status(400).json({ message: "ID da escola inválido." });

      }
      if (role == "estudante" && !classEntity) {
        return res.status(400).json({ message: "ID da turma inválido." });

      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Este email já está cadastrado." });
      }

      const existingUserCPF = await User.findOne({ cpf });
      if (existingUserCPF) {
        return res
          .status(400)
          .json({ message: "Este CPF já está cadastrado." });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
        role,
        image,
        address: {
          street: address.street,
          cep: address.cep,
          state: address.state,
          city: address.city,
        },
        IdSchool: "",
        IdClass: IdClass,
        approved: false,
      });


      const createdUser: UsersModel | undefined | null = await User.create(
        newUser
      );

      if (createdUser && createdUser._id) {
        const userReq = {
          id: createdUser._id.toString(),
          name: createdUser.name,
          cpf: createdUser.cpf
        };
        

        if (school) {
          school.pendingRequests.push(userReq);
          await school.save();
        } else {
          return res.status(404).json({ message: "Escola não encontrada." });
        }
        if (createdUser.role === "estudante") {
          if (classEntity) {
            classEntity.pendingRequests = classEntity.pendingRequests || [];
            classEntity.pendingRequests.push(userReq);
            await classEntity.save();
          } else {
            return res.status(404).json({ message: "Turma não encontrada." });
          }
        }
      }

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
      if (!email) {
        return res.status(422).json({ message: "O email é obrigatório!" });
      }
      if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória!" });
      }
      const checkPassword = await bcrypt.compare(password, userFind.password);
      if (!checkPassword) {
        return res.status(422).json({ message: "Senha inválida" });
      }
      return await TokenHelper.createUserToken(userFind, res);
    } else {
      return res
        .status(422)
        .json({ message: "Não há usuário cadastrado com esse e-mail" });
    }
  }

  public async TeacherInSchool(req: Request, res: Response): Promise<Response> {
    try {
        const { IdSchool } = req.params;

        if (!IdSchool) {
            return res.status(400).json({ message: 'schoolId é obrigatório' });
        }

        const professores = await User.find({ role: 'professor', IdSchool });

        return res.status(200).json(professores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar professores' });
    }
}

public async approveUser(req: Request, res: Response): Promise<Response> {
  try {
      const { userId, IdSchool } = req.body;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const school = await School.findById(IdSchool);
      if (!school) {
          return res.status(404).json({ message: "Escola não encontrada." });
      }

      // Remover o usuário da lista de pendingRequests verificando o campo _id
      school.pendingRequests = school.pendingRequests.filter(
          (request) => request.id !== userId
      );
      await school.save();

      // Adicionar usuário à turma, se ele for um estudante
      if (user.role === "estudante") {
          const classFound = await Class.findById(user.IdClass);
          if (classFound) {
              classFound.students.push(userId);
              await classFound.save();
          }
      }

      // Atualizar o status do usuário
      user.approved = true;
      user.IdSchool = IdSchool;
      await user.save();

      return res.status(200).json({ message: "Usuário aprovado com sucesso.", user });
  } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      return res.status(500).json({ message: "Erro ao aprovar usuário." });
  }
} 

  

  public async rejectUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, IdSchool } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const school = await School.findById(IdSchool);
      if (!school) {
        return res.status(404).json({ message: "Escola não encontrada." });
      }

      school.pendingRequests = school.pendingRequests.filter(
        (request) => request !== userId
      );
      await school.save();

      return res.status(200).json({
        message: "Solicitação do usuário rejeitada.",
      });
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
      return res.status(500).json({ message: "Erro ao rejeitar usuário." });
    }
  }
  public async editUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      console.log("userId:", userId); 
      const { name, email, phone, cpf, address } = req.body;
  
  
      if (!userId || userId === undefined) {
        return res.status(400).json({ message: "ID do usuário é obrigatório." });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Este email já está em uso." });
      }
  
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.cpf = cpf || user.cpf;
      user.address = {
        street: address?.street || user.address.street,
        cep: address?.cep || user.address.cep,
        state: address?.state || user.address.state,
        city: address?.city || user.address.city,
      };
  
      await user.save();
  
      return res.status(200).json({ message: "Usuário atualizado com sucesso.", user });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error); 
      return res.status(500).json({ message: "Erro ao atualizar usuário." });
    }
  }
  
}


export default new UserController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}

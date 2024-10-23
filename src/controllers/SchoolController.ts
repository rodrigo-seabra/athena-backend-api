import { json, Request, Response } from "express";
import School, { SchoolsModels } from "../models/School";
import bcrypt from "bcrypt";
import User from "../models/User";
import TokenHelper from "../helpers/TokenHelper";

const saltRounds = 10;

class SchoolController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      let schools: SchoolsModels[] = await School.find();
      return res.status(200).json({ schools });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar instituições" });
    }
  }
  public async schoolData (req: Request, res: Response) : Promise<Response>
  {
    const school = TokenHelper.School;
    if(!school)
    {
      return res.status(404).send({message: "Escola não encontrada!"})
    }
    return res.status(200).send({message: school})
  }
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Iniciando o processo de criação da instituição...");
      const {
        name,
        inepCode,
        cnpj,
        phone,
        email,
        password,
        address,
        institutionType,
        educationLevels,
        alvara,
        certificadoFuncionamento,
      } = req.body;
      
      console.log("Dados recebidos:", { name, inepCode, cnpj, phone, email, address, institutionType, educationLevels, alvara, certificadoFuncionamento });
      
      if (!name || !cnpj || !address || !institutionType) {
        console.log("Campos obrigatórios faltando:", { name, cnpj, address, institutionType });
        return res
          .status(400)
          .json({
            message: "Todos os campos obrigatórios devem ser preenchidos.",
          });
      }
      
      console.log("Verificando se a instituição já existe com o CNPJ:", cnpj);
      const existingSchool = await School.findOne({ cnpj });
      if (existingSchool) {
        console.log("Instituição já cadastrada:", existingSchool);
        return res
          .status(400)
          .json({
            message: "Esta instituição já está cadastrada com este CNPJ.",
          });
      }

      console.log("Hashing a senha...");
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("Senha hashada com sucesso.");

      console.log("Criando nova instância de School...");
      const newSchool: SchoolsModels = new School({
        name,
        inepCode,
        cnpj,
        phone,
        email,
        password: hashedPassword,
        address,
        institutionType,
        educationLevels,
        alvara,
        certificadoFuncionamento,
      });
      console.log("Nova escola criada:", newSchool);

      console.log("Salvando nova escola no banco de dados...");
      const createdSchool = await School.create(newSchool);
      console.log("Escola criada com sucesso:", createdSchool);

      console.log("Gerando token para a escola...");
      return await TokenHelper.createSchoolToken(createdSchool, res);

    } catch (error) {
      console.error("Erro ao criar instituição:", error);
      return res.status(500).json({ message: "Erro ao criar instituição." });
    }
}

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { cnpj, password } = req.body;

      if (!cnpj || !password) {
        return res
          .status(400)
          .json({ message: "CNPJ e senha são obrigatórios para login." });
      }

      const existingSchool = await School.findOne({ cnpj });

      if (!existingSchool) {
        return res.status(404).json({ message: "Instituição não encontrada." });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingSchool.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta." });
      }

      return await TokenHelper.createSchoolToken(existingSchool, res);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao realizar login." });
    }
  }
  public async listPendingRequests(req: Request, res: Response): Promise<Response> {
    try {
      const { schoolId } = req.params;
  
      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: "Escola não encontrada." });
      }
  
      const pendingRequestIds = school.pendingRequests.map((request) => request.id);
  
      console.log("Pending Requests IDs:", pendingRequestIds);
  
      const pendingUsers = await User.find({
        _id: { $in: pendingRequestIds },
      });
  
      console.log("Pending Users Found:", pendingUsers.length);
  
      return res.status(200).json({
        message: "Solicitações pendentes encontradas com sucesso.",
        pendingUsers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao listar solicitações pendentes." });
    }
  }
  
  
}

export default new SchoolController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}

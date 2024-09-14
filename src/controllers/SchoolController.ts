import { json, Request, Response } from "express";
import School, {SchoolsModels} from "../models/School";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Token from "../helpers/Token";

const saltRounds = 10;

class SchoolController{

    public async index (req:Request, res:Response) : Promise<Response>{
        try{
          let schools : SchoolsModels[] = await School.find();
          return res.status(200).json({schools})
        }catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Erro ao buscar instituições" });
        }
    }

    public async create (req: Request, res: Response) : Promise<Response>{
        try {
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
      
            if (!name || !cnpj || !address || !institutionType) {
              return res
                .status(400)
                .json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
            }
            const existingSchool = await School.findOne({ cnpj });
            if (existingSchool) {
              return res
                .status(400)
                .json({ message: "Esta instituição já está cadastrada com este CNPJ." });
            }
            
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newSchool: SchoolsModels = new School({
              name,
              inepCode,
              cnpj,
              phone,
              email,
              password : hashedPassword,
              address,
              institutionType,
              educationLevels,
              alvara,
              certificadoFuncionamento,
            });
            const createdSchool = await School.create(newSchool);
            return res.status(201).json({
              message: "Instituição criada com sucesso.",
              school: createdSchool,
            });
          } catch (error) {
            console.error(error);
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
      
          const isPasswordValid = await bcrypt.compare(password, existingSchool.password);
      
          if (!isPasswordValid) {
            return res.status(401).json({ message: "Senha incorreta." });
          }
      
          return res.status(200).json({
            message: "Login realizado com sucesso.",
            school: existingSchool,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Erro ao realizar login." });
        }
      }
}

export default new SchoolController();

function getErrorMessage(err: unknown) {
  throw new Error("Function not implemented");
}
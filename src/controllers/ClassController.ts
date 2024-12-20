import { Request, Response } from 'express';
import Class, { ClassModel } from '../models/Class'; // Modelo da turma
import School from '../models/School'; // Modelo da escola
import { ClassInterface } from '../interfaces/Class.interface';
import User from '../models/User';
import mongoose from 'mongoose';
import { Token } from 'natural';
import TokenHelper from '../helpers/TokenHelper';

class ClassController{
  public async getClassesByTeacher(req: Request, res: Response): Promise<Response> {
    try {
        const teacherId = TokenHelper.User?._id
        console.log(teacherId)
        if (!teacherId) {
            return res.status(400).json({ message: "ID do professor não fornecido." });
        }
        const classes: ClassInterface[] | null = await Class.find({
            teacher: teacherId 
        });

        if (!classes || classes.length === 0) {
            return res.status(404).json({ message: "Nenhuma turma encontrada para este professor." });
        }

        return res.status(200).json({ message: classes });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Erro interno do servidor" });
    }
}

    public async create (req:Request, res:Response) : Promise<Response>{
        try {
            const {
              name,
              grade,
              teacher,
              students,
              IdSchool,
              schedule,
              year,
              subject
            } = req.body;
        
            if (!name || !grade || !teacher || !IdSchool  || !year) {
              return res.status(400).json({
                message: 'Todos os campos obrigatórios devem ser preenchidos.'
              });
            }
        
            const schoolExists = await School.findById(IdSchool);
            if (!schoolExists) {
              return res.status(404).json({
                message: 'A escola especificada não foi encontrada.'
              });
            }
        
            const newClass: ClassInterface = new Class({
              name,
              grade,
              teacher,
              students,
              IdSchool,
              schedule,
              year,
              subject
            });
        
            const createdClass = await Class.create(newClass);
        
            return res.status(201).json({
              message: 'Turma criada com sucesso.',
              class: createdClass
            });
        
          } catch (error) {
            console.error(error);
            return res.status(500).json({
              message: 'Erro ao criar a turma.',
            });
          }}
    public async index (req: Request, res: Response) : Promise <Response>
    {
      try{
        let classes : ClassInterface[] | null= await Class.find();
        if ( !classes) {
          throw new Error( "Erro ao buscar turma" )
        }
        return res.status(200).json({message : classes})
      }catch( err : any)
      {
        return res.status(500).json({message: err})
      }
    }
    public async getClassBySchool(req: Request, res: Response): Promise<Response> {
      try {
        const { idschool } = req.params;
        if(!idschool)
        {
          return res.status(404).send({message: "School not found"})
        }
        let classes: ClassInterface[] | null = await Class.find({ IdSchool: idschool }); 
    
        if (!classes || classes.length === 0) {
          return res.status(404).json({ message: "Nenhuma turma encontrada para este idschool" });
        }
    
        return res.status(200).json({ message: classes });
      } catch (err: any) {
        return res.status(500).json({ message: err.message || "Erro interno do servidor" });
      }
    }
    public async listPendingRequests(req: Request, res: Response): Promise<Response> {
      try {
        const { classId } = req.params;
    
        const turma = await School.findById(classId);
        if (!classId) {
          return res.status(404).json({ message: "Escola não encontrada." });
        }
    
        const pendingRequestIds = turma?.pendingRequests.map((request) => request.id);
    
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

export default new ClassController();

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
}

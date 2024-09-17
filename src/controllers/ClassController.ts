import { Request, Response } from 'express';
import Class from '../models/Class'; // Modelo da turma
import School from '../models/School'; // Modelo da escola
import { ClassInterface } from '../interfaces/Class.interface';

class ClassController{
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

}

export default new ClassController();

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
}

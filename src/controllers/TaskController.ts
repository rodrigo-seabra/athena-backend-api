import { Request, Response } from "express";
import Task from "../models/Task"; 
class TaskController{
    public async create (req:Request, res:Response) : Promise<Response>{
        try {
            const {
              subject,
              content,
              dueDate,
              recipients,
              attachment,
              professorId,
              studentResponses
            } = req.body;
        
            // Verificar campos obrigatórios
            if (!subject || !content || !dueDate || !recipients || !professorId) {
              return res.status(400).json({
                message: "Todos os campos obrigatórios devem ser preenchidos."
              });
            }
        
            // Verificar se já existe uma tarefa semelhante (por exemplo, baseada no assunto e data de vencimento)
            const existingTask = await Task.findOne({ subject, dueDate });
            if (existingTask) {
              return res.status(400).json({
                message: "Já existe uma tarefa com o mesmo assunto e data de vencimento."
              });
            }
        
            // Criar a nova tarefa
            const newTask = new Task({
              subject,
              content,
              dueDate,
              recipients,
              attachment,
              professorId,
              studentResponses
            });
        
            const createdTask = await Task.create(newTask);
        
            return res.status(201).json({
              message: "Tarefa criada com sucesso.",
              task: createdTask
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao criar a tarefa." });
          }
    }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
}
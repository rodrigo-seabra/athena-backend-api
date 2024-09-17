import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import Token from "../helpers/Token";
import Middleware from "../middlewares/Middlewares";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { Req } from "../interfaces/Req.interface";
class TaskController {
    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                subject,
                content,
                dueDate,
                recipients,
                attachment,
                professorId,
                studentResponses,
            } = req.body;
            if (!subject || !content || !dueDate || !recipients || !professorId) {
                return res.status(400).json({
                    message: "Todos os campos obrigatórios devem ser preenchidos.",
                });
            }
            const existingTask = await Task.findOne({ subject, dueDate });
            if (existingTask) {
                return res.status(400).json({
                    message:
                        "Já existe uma tarefa com o mesmo assunto e data de vencimento.",
                });
            }
            const newTask = new Task({
                subject,
                content,
                dueDate,
                recipients,
                attachment,
                professorId,
                studentResponses,
            });
            const createdTask = await Task.create(newTask);
            return res.status(201).json({
                message: "Tarefa criada com sucesso.",
                task: createdTask,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao criar a tarefa." });
        }
    }
    public async addStudentResponse(
        req: Req,
        res: Response
    ): Promise<Response> {
        try {
            const {
                idTask,
                responseContent,
                attachment,
                date
            } = req.body;

            let user = req.user;
            console.log(user)

            if (!idTask || !user?._id || !responseContent) {
                return res.status(400).json({ message: 'Missing required fields: idTask, studentId, or responseContent' });
            }

            const existingTask = await Task.findOne({ _id: idTask } );
            if ( !existingTask ) {
                return res.status(404).json({ message: 'Task not found' });
            }

            const existingResponse : any = existingTask.studentResponses?.filter((data) => data.studentId == user._id);


            if (existingResponse && existingResponse.length > 0 ){
                return res.status(409).json({ message: 'Student already responded to this task' });

            }
  
            if (existingResponse) {
              return res.status(409).json({ message: 'Student already responded to this task' });
            }
            existingTask.studentResponses?.push( {
                    studentId: user._id.toString(),
                    responseContent: responseContent,
                    attachment: attachment,
                    graded: true,
                    submissionDate: new Date()
                }
            );
            existingTask.save();
            const response : any  = existingTask.studentResponses?.filter( data => data.studentId == user._id );
            if ( !response && response.length == 0) {
                throw new Error( "Respose not found." );
            }

            return res.status(200).json({ message:  response[0]._id });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export default new TaskController();

function getErrorMessage(err: unknown) {
    throw new Error("Function not implemented");
}

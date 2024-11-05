import { Request, Response } from 'express';
import Experience from '../models/Experience';
import { ExperienceInterface } from '../interfaces/Experience.interface';

class ExperienceController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, title, description } = req.body;

      if (!userId || !title || !description) {
        return res.status(400).json({
          message: 'Todos os campos obrigatórios devem ser preenchidos.',
        });
      }

      const newExperience: ExperienceInterface = new Experience({
        userId,
        title,
        description,
      });

      const createdExperience = await Experience.create(newExperience);

      return res.status(201).json({
        message: 'Relato criado com sucesso.',
        experience: createdExperience,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Erro ao criar o relato.',
      });
    }
  }

  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const experiences: ExperienceInterface[] = await Experience.find();
      return res.status(200).json({ message: experiences });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar relatos.' });
    }
  }
}

export default new ExperienceController();

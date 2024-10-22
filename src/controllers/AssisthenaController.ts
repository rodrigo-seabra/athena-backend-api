import { Request, Response } from 'express';
import { AssisthenaService } from '../services/AssisthenaService';

export class AssisthenaController {
  private assisthenaService: AssisthenaService;

  constructor() {
    this.assisthenaService = new AssisthenaService();
  }

  public async handleMessage(req: Request, res: Response): Promise<Response> {
    const { message, userId, userType } = req.body; // Adicionado userType

    try {
      const tokens = this.assisthenaService.processMessage(message);
      const sentiment = this.assisthenaService.analyzeSentiment(message);
      const intention = await this.assisthenaService.classifyMessage(message);
      const response = this.assisthenaService.getResponseForIntent(intention, userType); // Passando userType

      return res.json({ tokens, sentiment, intention, response });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao processar mensagem.' });
    }
  }

  public async handleInsights(req: Request, res: Response) {
    const { userType, context } = req.body; 
    const insight = this.assisthenaService.getInsights(userType, context); // Passe o contexto se necessário
    
    res.json({ insight });
  }
  
}
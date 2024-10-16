import { Router } from 'express';
import { AssisthenaController } from '../controllers/AssisthenaController';
import AuthMiddleware from '../middlewares/AuthMiddleware';

class AssisthenaRoutes {
  public routes: Router;
  
  public constructor() {
    this.routes = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const assisthenaController = new AssisthenaController();
    this.routes.post('/assisthena/message', (req, res) => assisthenaController.handleMessage(req, res));
  }
}

export default new AssisthenaRoutes().routes;

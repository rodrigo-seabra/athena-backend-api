import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
import Middlewares from "../middlewares/Middlewares";
import ClassController from "../controllers/ClassController";

class Routes {
  public routes: Router;
  public constructor() {
    this.routes = Router();
    this.UserRoutes();
    this.SchoolRoutes();
    this.TaskRoutes();
    this.ClassRoutes();
  }

  private UserRoutes() {
    this.routes.get("/user", UserController.index);
    this.routes.post("/user/create", UserController.create);
    this.routes.post("/login", UserController.login);
  }
  private SchoolRoutes(){
    this.routes.get("/school", SchoolController.index);
    this.routes.post("/school/create", SchoolController.create);
    this.routes.post("/school/login", SchoolController.login);
  }
  private TaskRoutes(){
    this.routes.post("/taks", Middlewares.authTaskCreationMiddleware, TaskController.create);
  }
  private ClassRoutes(){
    this.routes.post("/class", Middlewares.authClassCreationMiddleware,ClassController.create);
  }


}
export default new Routes().routes;
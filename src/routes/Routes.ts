import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
import Middlewares from "../middlewares/Middlewares";
import ClassController from "../controllers/ClassController";
import AuthMiddlware from "../middlewares/AuthMiddleware";

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
    this.routes.post("/taks", AuthMiddlware.Authenticator , AuthMiddlware.Authorization, TaskController.create);
    this.routes.post("/taks/response", AuthMiddlware.Authenticator , AuthMiddlware.Authorization ,TaskController.addStudentResponse)
  }
  private ClassRoutes(){
    this.routes.post("/class", AuthMiddlware.Authenticator , AuthMiddlware.Authorization ,ClassController.create);
  }


}
export default new Routes().routes;
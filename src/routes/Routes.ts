import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";

class Routes {
  public routes: Router;
  public constructor() {
    this.routes = Router();
    this.UserRoutes();
    this.SchoolRoutes();
    this.TaskRoutes();
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
    this.routes.post("/taks", TaskController.create);
  }


}
export default new Routes().routes;
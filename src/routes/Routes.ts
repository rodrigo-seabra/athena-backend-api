import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
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
    this.routes.post('/user/approve', UserController.approveUser);
    this.routes.post('/user/reject', UserController.rejectUser); 
  }
  private SchoolRoutes(){
    this.routes.get("/school", SchoolController.index);
    this.routes.post("/school/create", SchoolController.create);
    this.routes.post("/school/login", SchoolController.login);
    this.routes.get('/schools/:schoolId/pending-requests', SchoolController.listPendingRequests); 
  }
  private TaskRoutes(){
    this.routes.post("/tasks/create", AuthMiddlware.Authorization, TaskController.create);
    this.routes.post("/tasks/response", AuthMiddlware.Authorization ,TaskController.addStudentResponse)
    this.routes.post("/tasks/correction", AuthMiddlware.Authorization,TaskController.addTeacherResponse)
    this.routes.get("/tasks/stats/:professorId", TaskController.getTeacherStats)

  }
  private ClassRoutes(){
    this.routes.post("/class",ClassController.create);
    this.routes.get("/getall/class",  ClassController.index);

  }


}
export default new Routes().routes;
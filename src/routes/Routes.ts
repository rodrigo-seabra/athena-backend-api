import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
import ClassController from "../controllers/ClassController";
import AuthMiddlware from "../middlewares/AuthMiddleware";
import StatsController from "../controllers/StatsController";
import AssisthenaRoutes from './AssisthenaRoutes';


class Routes {
  public routes: Router;
  public constructor() {
    this.routes = Router();
    this.UserRoutes();
    this.SchoolRoutes();
    this.TaskRoutes();
    this.ClassRoutes();
    this.StatsRoutes();
    this.AssisthenaRoutes(); 

  }
  private AssisthenaRoutes() {
    this.routes.use('/teste', AssisthenaRoutes);
  }

  private UserRoutes() {
    this.routes.get("/user", AuthMiddlware.Authorization, UserController.index);
    this.routes.post("/user/create", UserController.create);
    this.routes.post("/user/login", UserController.login);
    this.routes.post('/user/approve', UserController.approveUser);
    this.routes.post('/user/reject', UserController.rejectUser); 
    this.routes.get("/user/function", AuthMiddlware.Authorization, UserController.userFunction)
    this.routes.get("/user/allteachers/:IdSchool", UserController.TeacherInSchool)
    this.routes.put("/user/edit/:userId", AuthMiddlware.Authorization, UserController.editUser);
  }
  
  private SchoolRoutes(){
    this.routes.get("/school", SchoolController.index);
    this.routes.post("/school/create", SchoolController.create);
    this.routes.post("/school/login", SchoolController.login);
    this.routes.get('/schools/:schoolId/pending-requests', AuthMiddlware.schoolAuthorization , SchoolController.listPendingRequests); 
    this.routes.get("/school/data", AuthMiddlware.schoolAuthorization, SchoolController.schoolData)
  }
  private TaskRoutes(){
    this.routes.get("/tasks/responsesbytask/:taskId", TaskController.getTaskResponsesById)
    this.routes.post("/tasks/create", AuthMiddlware.Authorization, TaskController.create);
    this.routes.post("/tasks/response", AuthMiddlware.Authorization ,TaskController.addStudentResponse)
    this.routes.post("/tasks/correction", AuthMiddlware.Authorization,TaskController.addTeacherResponse)
    this.routes.get("/tasks/getId/:id", AuthMiddlware.BasicAuth ,TaskController.getTaskById)
    this.routes.get("/tasks/completed/:userId?/:teacherId?",TaskController.getCompletedTasks)
    this.routes.get("/tasks/dueSoon/:userId?/:teacherId?", TaskController.getTasksDueSoon)
    this.routes.get("/tasks/overdue/:userId?/:teacherId?",  TaskController.getOverdueTasks)
    this.routes.get('/tasks/getalluser/:userId?/:teacherId?', TaskController.getAllTasks)
    this.routes.get("/task/getall/userbyclass/:userId", TaskController.getAllByUserByClass)
    // this.routes.get("/tasks/overdue/:userId", TaskController.getOverdueTasksByClass )
    this.routes.get("/tasks/completed/:userId", TaskController.getAllCompleteByUserByClass)
    this.routes.get("/overdue/:userId", TaskController.getOverdueTasksByClass)
    this.routes.get("/duesoon/:userId", TaskController.getTasksDueSoonByClass)
    // this.routes.get("/tasks/dueSoon/:userId", TaskController.getTasksDueSoonByClass)

  }
  private ClassRoutes(){
    this.routes.post("/class", AuthMiddlware.schoolAuthorization, ClassController.create);
    this.routes.get("/class/:idschool", ClassController.getClassBySchool)
    this.routes.get("/getall/class",  ClassController.index);
    this.routes.get('/classes/teacher', AuthMiddlware.teacherAuth, ClassController.getClassesByTeacher);
    this.routes.get('/class/:classId/pending-requests', ClassController.listPendingRequests); 
  }

  private StatsRoutes()
  {

    this.routes.get("/stats/performance/:classId", StatsController.getPerformanceByClass)
    this.routes.get("/stats/:IdTeacher", StatsController.getTeacherStats)
    this.routes.post("/stats", StatsController.generateAndSaveStats)
    this.routes.get("/stats/:taskId", StatsController.getStatsByTask)
    this.routes.get("/stats/getschool/:IdSchool", StatsController.getStatsBySchool)
    this.routes.get("/stats/getclass/:IdClass", StatsController.getStatsByClass)
    this.routes.get("/stats/getstudent/:studentId", StatsController.getStatsByStudent)
  }


}
export default new Routes().routes;
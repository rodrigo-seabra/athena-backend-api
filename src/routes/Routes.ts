import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
import ClassController from "../controllers/ClassController";
import AuthMiddlware from "../middlewares/AuthMiddleware";
import StatsController from "../controllers/StatsController";
import AssisthenaRoutes from './AssisthenaRoutes';
import UpdateStatusesMiddleware from "../middlewares/UpdateStatusesMiddleware ";
import StudentStatsController from "../controllers/StudentStatsController";
import ScheduleController from "../controllers/ScheduleController";

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

  private ScheduleRoutes() {
    this.routes.post("/schedule", ScheduleController.create);
    this.routes.get("/schedule/:classId", ScheduleController.getByClass);
    this.routes.put("/schedule/:classId", ScheduleController.update);
    this.routes.delete("/schedule/:classId", ScheduleController.delete);

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

  private SchoolRoutes() {
    this.routes.get("/school", SchoolController.index);
    this.routes.post("/school/create", SchoolController.create);
    this.routes.post("/school/login", SchoolController.login);
    this.routes.get('/schools/:schoolId/pending-requests', AuthMiddlware.schoolAuthorization, SchoolController.listPendingRequests);
    this.routes.get("/school/data", AuthMiddlware.schoolAuthorization, SchoolController.schoolData)
  }
  private TaskRoutes() {
    this.routes.get("/tasks/responsesbytask/:taskId", TaskController.getTaskResponsesById)
    this.routes.post("/tasks/create", AuthMiddlware.Authorization, TaskController.create);
    this.routes.post("/tasks/response", AuthMiddlware.Authorization, TaskController.addStudentResponse)
    this.routes.post("/tasks/correction", AuthMiddlware.Authorization, StudentStatsController.addTeacherResponse)
    this.routes.get("/tasks/getId/:id", AuthMiddlware.BasicAuth, TaskController.getTaskById)
    this.routes.get("/tasks/completed/:teacherId?", TaskController.getCompletedTasks)
    this.routes.get("/tasks/dueSoon/:teacherId?", TaskController.getTasksDueSoon)
    this.routes.get("/tasks/overdue/:teacherId?", TaskController.getOverdueTasks)
    this.routes.get('/tasks/getalluser/:teacherId?', TaskController.getAllTasks)
    this.routes.get("/task/getall/userbyclass/:userId", UpdateStatusesMiddleware.update, TaskController.getAllByUser)
    this.routes.get("/tasks/completed/:userId", UpdateStatusesMiddleware.update, TaskController.getAllCompleteByUser)
    this.routes.get("/tasks/completed-user/:userId", UpdateStatusesMiddleware.update, TaskController.getAllCompleteByUser)
    this.routes.get("/tasks/delay/:userId", UpdateStatusesMiddleware.update, TaskController.getOverdueTasksByUser)
    this.routes.get("/tasks/duesoon/:userId", UpdateStatusesMiddleware.update, TaskController.getTasksDueSoonByUser)
    this.routes.get("/tasks/inprogress/:userId", UpdateStatusesMiddleware.update, TaskController.getPendingTasksByUser)
    this.routes.get("/tasks/usergrade/:userId", TaskController.getUserGrades)

  }
  private ClassRoutes() {
    this.routes.post("/class", AuthMiddlware.schoolAuthorization, ClassController.create);
    this.routes.get("/class/:idschool", ClassController.getClassBySchool)
    this.routes.get("/getall/class", ClassController.index);
    this.routes.get('/classes/teacher', AuthMiddlware.teacherAuth, ClassController.getClassesByTeacher);
    this.routes.get('/class/:classId/pending-requests', ClassController.listPendingRequests);
  }

  private StatsRoutes() {

    this.routes.get("/stats/performance/:classId", StatsController.getPerformanceByClass)
    this.routes.get("/stats/:IdTeacher", StatsController.getTeacherStats)
    this.routes.post("/stats", StatsController.generateAndSaveStats)
    this.routes.get("/stats/:taskId", StatsController.getStatsByTask)
    this.routes.get("/stats/getschool/:IdSchool", StatsController.getStatsBySchool)
    this.routes.get("/stats/getclass/:IdClass", StatsController.getStatsByClass)
    this.routes.get("/stats/getstudent/:studentId", StatsController.getStatsByStudent)

    this.routes.post("/stats/proficiency", StudentStatsController.updateProficiency);
    this.routes.get("/stats/proficiency/:userId", StudentStatsController.getProficiencyByUser);
    this.routes.get("/stats/semester/:userId", StudentStatsController.getSemesterPerformance);

    this.routes.get("/class/:classId/proficiency", StudentStatsController.getProficiencyByClass);
  }


}
export default new Routes().routes;
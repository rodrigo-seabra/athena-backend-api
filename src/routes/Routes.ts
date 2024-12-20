import { Router } from "express";
import UserController from "../controllers/UserController";
import SchoolController from "../controllers/SchoolController";
import TaskController from "../controllers/TaskController";
import ClassController from "../controllers/ClassController";
import AuthMiddlware from "../middlewares/AuthMiddleware";
import StatsController from "../controllers/StatsController";
import UpdateStatusesMiddleware from "../middlewares/UpdateStatusesMiddleware ";
import StudentStatsController from "../controllers/StudentStatsController";
import ScheduleController from "../controllers/ScheduleController";
import AttendanceController from "../controllers/AttendanceController"; // Importando o AttendanceController
import ExperienceController from "../controllers/ExperienceController";
class Routes {
  public routes: Router;
  public constructor() {
    this.routes = Router();
    this.routes.get("/", this.getRoot); 

    this.UserRoutes();
    this.SchoolRoutes();
    this.TaskRoutes();
    this.ClassRoutes();
    this.StatsRoutes();
    this.ScheduleRoutes();
    this.AttendanceRoutes(); 
    this.ExperienceRoutes();
  }
  private ExperienceRoutes() {
    this.routes.post("/experience", ExperienceController.create);
    this.routes.get("/experience", ExperienceController.index);

 }

  private AttendanceRoutes() {
     this.routes.post("/attendance/registerWithFaceDescriptor", AttendanceController.registerWithFaceDescriptor);
     this.routes.post("/attendance/registerAttendance", AttendanceController.registerAttendance);
     this.routes.post("/attendance/manualRegister", AttendanceController.manualRegister);
    this.routes.get("/attendance/:studentId", AttendanceController.getOverallAttendanceRate); 
    this.routes.get("/attendance/school/:schoolId", AttendanceController.getAttendanceBySchool);
    this.routes.get("/student-count", AttendanceController.getDailyStudentCount)
     this.routes.get("/attendance/class/:classId", AttendanceController.getAttendanceByClass);
  }

  private ScheduleRoutes() {
    this.routes.post("/schedule/create", ScheduleController.create);
    this.routes.get("/schedule/:classId", ScheduleController.getByClass);
    this.routes.put("/schedule/:classId", ScheduleController.update);
    this.routes.delete("/schedule/:classId", ScheduleController.delete);
  }

  private UserRoutes() {
    this.routes.post("/confirm-password", AuthMiddlware.BasicAuth ,UserController.confirmPassword)
    this.routes.get("/user", AuthMiddlware.Authorization, UserController.index);
    this.routes.post("/user/facelogin", UserController.loginWithFaceDescriptor)
    this.routes.post("/face", AuthMiddlware.BasicAuth, UserController.updateFaceDescriptor)
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

  private getRoot(req: any, res: any) {
    const response = {
      message: "Bem-vindo à API do Projeto!",
      routes: {
        "/user": "Gerenciar usuários",
        "/school": "Gerenciar escolas",
        "/tasks": "Gerenciar tarefas",
        "/class": "Gerenciar turmas",
        "/attendance": "Gerenciar frequência",
        "/schedule": "Gerenciar horários",
        "/stats": "Estatísticas",
      },
      note: "Use a rota apropriada para acessar os recursos disponíveis.",
    };
    res.status(200).json(response);
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
    this.routes.get('/tasks/getAll/:schoolId?', TaskController.getTaskCompletionStatsBySchool)
    this.routes.get('/tasks/getGrades/:schoolId?', TaskController.getAverageGradesBySchool)

    this.routes.get("/task/getall/userbyclass/:userId", TaskController.getAllByUser)
    this.routes.get("/pong",  UpdateStatusesMiddleware.update, TaskController.ping)
    this.routes.get("/tasks/completed/:userId", TaskController.getAllCompleteByUser)
    this.routes.get("/tasks/completed-user/:userId", TaskController.getAllCompleteByUser)
    this.routes.get("/tasks/delay/:userId", TaskController.getOverdueTasksByUser)
    this.routes.get("/tasks/duesoon/:userId", TaskController.getTasksDueSoonByUser)
    this.routes.get("/tasks/duesoon-user/:userId", TaskController.getTasksDueSoonByUser)
    this.routes.get("/tasks/getalltasksclass/:classId", TaskController.getTasksByClassId)
    this.routes.get("/tasks/inprogress/:userId", TaskController.getPendingTasksByUser)
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
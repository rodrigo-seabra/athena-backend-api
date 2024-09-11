import { Router } from "express";
import UserController from "../controllers/UserController";


class Routes {
  public routes: Router;
  public constructor() {
    this.routes = Router();
    this.UserRoutes();
  }

  private UserRoutes() {
    this.routes.get("/user", UserController.index);
    this.routes.post("/user/create", UserController.create);
    this.routes.post("/login", UserController.login);
  }


}
export default new Routes().routes;
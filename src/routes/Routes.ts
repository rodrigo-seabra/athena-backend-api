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

  }


}
export default new Routes().routes;
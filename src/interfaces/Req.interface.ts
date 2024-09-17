import { Request} from "express";

import { UsersModel } from "../models/User";

export  interface Req extends Request {
    user?: UsersModel | null;
  }
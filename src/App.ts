import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import Routes from "./routes/Routes";

class App{
    public express: express.Application;
    public constructor() {
        this.express = express();
        this.database();
        this.middleware();
        this.routes();
        this.express.listen(process.env.PORT || 8080);
        console.log(`run on port ${process.env.PORT}`)
      }
      private middleware(): void {
        this.express.use(express.json());
        this.express.use(express.static("public"));
      this.express.use(cors());
      }
    
      private database(): void {
        mongoose.set("strictQuery", false);
        const connectionString = process.env.CONNECTIONSTRING;
        if (!connectionString) {
          throw new Error("CONNECTIONSTRING environment variable is not defined.");
        }
        mongoose
          .connect(connectionString)
          .then(() => console.log("Connected to MongoDB"))
          .catch((err) => console.error("Could not connect to MongoDB", err));
      }
      private routes(): void {
        this.express.use(Routes);
      }

}
export default new App().express; 
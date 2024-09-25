import { Schema, model, Document } from "mongoose";
import { UsersInterface } from "../interfaces/User.interface";

const UsersSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
      cpf: {
        type: String,
        required: true,
      },
      role:{
        type: String,
        enum: ['diretor','professor', 'estudante', 'coordenador', 'inspetor', 'limpeza', 'cozinha', 'outro']
      },
      address:{
        street: { type: String, required: true },
        cep: {type: String, required: true},
        state: {type: String, required: true},
        city: {type: String, required :true}
      },
      IdSchool: {
        type: String,
      },
      IdClass: {
        type: String,
      },
      approved: {
        type: Boolean,
      }
    },
    {
      timestamps: true,
    }
  );
  export interface UsersModel extends UsersInterface, Document {}
  export default model<UsersModel>("User", UsersSchema);

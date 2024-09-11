
import { Schema, model, Document } from "mongoose";
import { SchoolInterface } from "../interfaces/School.interface";

const SchoolsSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      inepCode: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
      cnpj: {
        type: String,
        required: true,
      },
      institutionType:{
        type: String,
        enum: ['escola publica','universidade publica', 'instituto técnico', 'creche', 'curso livre', 'outro', 'universidade publica', 'escola privada' ]
      },
      educationLevels:{
        type: [String],
        enum: ['infantil','fundamental I', 'fundamental II', 'médio', 'técnico', 'superior', 'pós-graduação', 'mestrado', 'doutorado', 'EJA', 'outro' ]
      },
      address:{
        street: { type: String, required: true },
        cep: {type: String, required: true},
        state: {type: String, required: true},
        city: {type: String, required :true}
      },
      status: {
        type: Boolean,
      },
      password: {
        type: String,
        required: true,
      },
      alvara: {
        type: String,
      },
      certificadoFuncionamento:{
        type: String,
      }
    },
    {
      timestamps: true,
    }
  );
  export interface SchoolsModels extends SchoolInterface, Document {}
  export default model<SchoolsModels>("School", SchoolsSchema);
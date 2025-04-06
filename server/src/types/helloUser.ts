import { InferSchemaType } from "mongoose";
import { helloUserSchema } from "../models/Hello.js";

export type HelloUserType = InferSchemaType<typeof helloUserSchema>;

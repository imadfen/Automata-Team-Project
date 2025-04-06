// please make sure to enable timestamps in every model's schema

import mongoose from "mongoose";

const helloUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const helloUserModel = mongoose.model("HelloUser", helloUserSchema);

export { helloUserModel, helloUserSchema };

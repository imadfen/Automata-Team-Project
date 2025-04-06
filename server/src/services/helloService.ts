import { checkConnection } from "../config/db.js";
import { helloUserModel } from "../models/Hello.js";
import { HelloUserType } from "../types/helloUser.js";

const hello = async () => {
  const isConnected = await checkConnection();

  if (!isConnected) {
    return "Database is not connected";
  }
  // await helloUserModel
  //   .create({
  //     name: "John Doe",
  //   })
  //   .catch((err) => {
  //     console.error("Error creating user:", err);
  //   });
  // return { message: "created first collection" };

  return await helloUserModel
    .find({})
    .then((data: HelloUserType[]) => {
      console.log("Fetched users:", data);
      return { data };
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
    });
};

export { hello };

import mongoose from "mongoose";

const connectDB = async () => {
  console.log("connecting to the database");
  try {
    if (
      await mongoose.connect(
        `${process.env.MONGODB_URI!}/${process.env.DB_NAME!}`,
      )
    ) {
      console.log("connected to database");
    }
  } catch (err) {
    console.log(err);
  }
};

const checkConnection = async (): Promise<boolean> => {
  const connectionState = mongoose.connection.readyState;
  if (connectionState === 1) {
    console.log("Database is connected");
    return true;
  } else if (connectionState === 2) {
    console.log("Database is connecting");
    return false;
  } else if (connectionState === 3) {
    console.log("Database is disconnecting");
    return false;
  } else {
    console.log("Database is disconnected");
    return false;
  }
};

export { connectDB, checkConnection };

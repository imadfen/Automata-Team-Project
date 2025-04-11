import { checkConnection } from "../config/db.js";
import { helloUserModel } from "../models/Hello.js";
import { HelloUserType } from "../types/helloUser.js";
// import generateInstructions from "../utils/generateRobotInstructions.ts";
// import { WarehouseService } from "./warehouseService.ts";

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

  // const warehouse = new WarehouseService();

  // // Add some test shelves to create a realistic layout
  // const shelf1 = warehouse.addShelf({
  //   x: 5,
  //   y: 3,
  //   orientation: "HORIZONTAL",
  // });

  // const shelf2 = warehouse.addShelf({
  //   x: 5,
  //   y: 6,
  //   orientation: "HORIZONTAL",
  // });

  // const shelf3 = warehouse.addShelf({
  //   x: 10,
  //   y: 3,
  //   orientation: "HORIZONTAL",
  // });

  // // Display the warehouse grid
  // console.log("\nWarehouse Layout:");
  // console.log("Legend: H=Home, █=Shelf, ·=Aisle, .=Empty, X=Obstacle");
  // console.log("-".repeat(50));
  // console.log(warehouse.getGridVisualization());
  // console.log("-".repeat(50));

  // // Test path finding to a slot
  // const slotId = `slot_${shelf1}_0_0_FRONT`;
  // const path = warehouse.findPathToSlot(slotId);

  // if (path) {
  //   console.log("\nPath found to slot:", slotId);
  //   console.log("Path:", path);
  //   const instructions = generateInstructions(path);
  //   console.log("Robot instructions:", instructions);
  // } else {
  //   console.log("\nNo valid path found to slot:", slotId);
  // }

  return await helloUserModel
    .find({})
    .then((data: HelloUserType[]) => {
      console.log("\nFetched users:", data);
      return { data };
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
    });
};

export { hello };

import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "../.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server started on port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error in starting the server");
  });

// ;( async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log("connection SUCCESS Host: ", connectionInstance.connection.host );
//     } catch (error) {
//         console.error("Connection FAILED: ", error);
//         process.exit(1)
//     }
// })()

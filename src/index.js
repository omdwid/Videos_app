import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({ path: "../.env" });
connectDB();

// ;( async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log("connection SUCCESS Host: ", connectionInstance.connection.host );
//     } catch (error) {
//         console.error("Connection FAILED: ", error);
//         process.exit(1)
//     }
// })()

import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import app from "./app.js";
import prisma from "./db/index.js"; // Prisma client singleton

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Ensure the Prisma client can connect before starting the HTTP server
    await prisma.$connect();
    console.log("✅ Database connection established");
    app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

startServer();





































































// its not good practice to connect db in backend 
// import express from 'express'
// const app =express();

// (
//     async()=>{
//         try{
//             await mongoose.connect(`${process.env.MONGODB_URI}/${Db_name}`);
//             app.on((error),()=>{
//                 console.log("error :",error)
//                 throw error
//             })
//             app.listen(process.env.PORT,()=>{
//                 console.log('App is listening on port ${P}')
//             })
//         }catch(error){
//             console.log("Error :",error);
//             throw error
//         }
//     }
// )()    

// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('${process.Backend.env.MONGODB_URI}/{Db_name}');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }
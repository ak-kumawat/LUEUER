import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
import connectDb from "./db/index.js";
connectDb()
.then(()=>{
    app.on((error),()=>{
                console.log("error :",error)
                throw error
            })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT} `);
        
    })
})
.catch((err)=>{
    console.log("MONGODB CONNECTION FAILURE !!",err);
    
})





































































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
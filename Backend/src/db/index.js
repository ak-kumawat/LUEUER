import mongoose from "mongoose"
import { Db_name } from "../constants.js"

const connectDb=async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${Db_name}`)
        console.log(`\n mongodb connected !! DB HOST :${connectionInstance.connection.host}`)
        //assignment see console.log detail clearly connectionInstance

    } catch (error) {
        console.log("MONGODB connection error ",error)
        process.exit(1)
    }
}
export default connectDb;
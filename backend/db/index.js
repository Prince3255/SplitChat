import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const connect_DB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongodb connected", connectionInstance.connection.host)
    } catch (error) {
        console.log('MONGODB connection Failed', error.message)
        process.exit(1)
    }
}

export default connect_DB
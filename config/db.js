const  mongoose = require('mongoose');

const connectDB = async () => {
    //suppress deprecate ปราบปรามการคัดค้าน
    mongoose.set('strictQuery', true);
    //async and await is couple
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
}

module.exports = connectDB;
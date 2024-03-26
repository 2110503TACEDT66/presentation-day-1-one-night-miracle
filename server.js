const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const cars = require('./routes/cars');
const rental=require('./routes/rental');
const auth =require('./routes/auth');



const app = express();
//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//Cors
app.use(cors());

app.use('/api/v1/cars', cars);
app.use('/api/v1/auth',auth);
app.use('/api/v1/rental',rental);


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandle promise rejections
process.on('unhandleRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});

//nodemon for restart all new save
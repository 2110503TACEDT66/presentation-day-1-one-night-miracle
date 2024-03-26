const mongoose=require('mongoose');

const RentalSchema=new mongoose.Schema({//เพิ่มตัวแปร isPaid เป็น true or false

    pickupDate:{
        type:Date,
        required:true
    },
    returnDate:{
        type:Date,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    car:{
        type: mongoose.Schema.ObjectId,
        ref:'Car',
        required:true
    },
    provider:{
        type:String,
        required:true
    },
    isPaid:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
module.exports=mongoose.model('Rental',RentalSchema);
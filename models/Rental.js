const mongoose=require('mongoose');

const RentalSchema=new mongoose.Schema({

    rentalDate:{
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
    createdAt:{
        type:Date,
        default:Date.now
    }
});
module.exports=mongoose.model('Rental',RentalSchema);
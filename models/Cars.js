
const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    carid: {
        type: String,
        required: [true,'Please add a carid'],
        unique: true,
        trim: true,
        maxlength:[50, 'carid can not be more than 50 characters']
    },
    pricerate: {
        type: String,
        required: [true,'Please add a pricerate']
    },
    model: {
        type: String,
        required: [true,'Please add a model']
    },
    cartype: {
            type: String,
            required: [true,'Please add a cartype']        
    },
    numberofseat: {
        type: String,
        required: [true, 'Please add a number of seat']
    },
    gearsystem: {
        type: String,
        required: [true,'Please add a gearsystem'],
    }
   }, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
   });


//Cascade delete rentals when a car is deleted
    CarSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Rental being removed from car ${this._id}`);
    await mongoose.model('Rental').deleteMany({car:this._id});
    next();
});

   //reverse populate with virtuals
   CarSchema.virtual('rentals',{
    ref:'Rental',
    localField:'_id',
    foreignField:'car',
    justOne:false
   });

module.exports = mongoose.model('Car', CarSchema);
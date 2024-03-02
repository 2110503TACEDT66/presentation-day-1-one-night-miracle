const { Int32 } = require('mongodb');
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
        type: Number,
        required: [true,'Please add a pricerate']
    },
    status: {
        type: String,
        default: "available"
    },
    model: {
        type: String,
        required: [true,'Please add a model']
    },
    cartype: {
            type: String,
            required: [true,'Please add a postalcode']        
    },
    numberofseat: {
        type: Number,
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

   //reverse populate with virtuals
   CarSchema.virtual('rentals',{
    ref:'Rental',
    localField:'_id',
    foreignField:'car',
    justOne:false
   });
//Cascade delete appointments when a hospital is deleted
    CarSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Rental being removed from car ${this._id}`);
    await this.model(`Appointment`).deleteMany({car:this._id});
    next();
})

module.exports = mongoose.model('Car', CarSchema);
const Rental =require('../models/Rental');
const Cars =require('../models/Cars');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');

//@desc Get all rentals
//@route GET /api/v1/rental
//@access public
exports.getRentals=async(req,res,next)=>{
    let query;
    //General users can see only their rentals!
    if(req.user.role !== 'admin'){
        query=Rental.find({user:req.user.id}).populate({
            path:'car',
            select:'carid model pricerate'
        });
    }else {//If you are an admin , you can see all!
        if(req.params.carId){
            console.log(req.params.carId);
            query=Rental.find({car:req.params.carId}).populate({
                path:"car",
                select:"carid model pricerate"
            });
        }else query =await Rental.find().populate({
            path:'car',
            select:'carid model pricerate'
        });
    }
    try{
        const rentals=await query;
        res.status(200).json({
            success:true,
            count:rentals.length,
            data:rentals
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,message:"Cannot find Rental"
        });
    }
};

//@desc Get single rental
//@route GET /api/v1/rental/:id
//@access Public
exports.getRental=async(req,res,next)=>{
    try{
        const rental=await Rental.findById(req.params.id).populate({
            path:'car',
            select:'carid model pricerate'
        });

        if(!rental){
            return res.status(400).json({success:false,messege:`No rental with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:rental});
    }catch(error){
       console.log(error);
       return res.status(500).json({success:false,messege:'Cannot find Rental'});
    }
};

//@Desc Add rental
//@route POST /api/v1/cars/:carId/rental
//@access Private
exports.createRental=async (req,res,next)=>{
    try{
        req.body.car=req.params.carId;

        const car=await Cars.findById(req.params.carId);
    
    if(!car){
        return res.status(400).json({success:false,messege:`No car with the id of ${req.params.carId}`});
    }

    
    //add user Id to req.body
    req.body.user=req.user.id;
    
    //Check for existed rental
    const existedRental = await Rental.find({user:req.user.id});

    const rentalWithThisCar = await Rental.findOne({car:req.params.carId});

    if(rentalWithThisCar){
        return res.status(400).json({success:false,messege:`You've already had a rental of this car`});
    }

    //if the user is not an admin, they can only create 3 rentals.
    if(existedRental.length >= 3 && req.user.role !== 'admin'){
        return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 rentals`});
    }
    
    const rental= await Rental.create(req.body);
         res.status(201).json({
            success:true,
            data:rental
         });
}catch(error){
    console.log(error);
    return res.status(500).json({success:false,message:"Cannot create Rental"});
}};


//@Desc Update rental
//@route PUT /api/v1/rental/:id
//@access Private
exports.updateRental=async (req,res,next)=>{
try{
    let rental = await Rental.findById(req.params.id);
    
    if(!rental){
        return res.status(404).json({success:false,messege:`No rental with the id of ${req.params.id}`});
    }

    //Make sure user is the rental owner
    if(rental.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this rental`});
    }

    rental=await Rental.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data:rental
    });
}catch(error){
    console.log(error);
    return res.status(500).json({success:false,messege:"Cannot Update Rental"});
}
};

//@Desc Delete rental
//@route DELETE /api/v1/rental/:id
//@access Private
exports.deleteRental=async (req,res,next)=>{
    try{
        const rental = await Rental.findById(req.params.id);
        
        if(!rental){
            return res.status(404).json({success:false,messege:`No rental with the id of ${req.params.id}`});
        }
     //Make sure user is the rental owner
     if(rental.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this rental`});
    }

        await rental.deleteOne();
    
        res.status(200).json({
            success:true,
            data:{}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,messege:"Cannot Delete Rental"});
    }
};

//@Desc Pay all unpaid rentals at once
//@route PUT /api/v1/rental/pay
//@access Private
exports.payRentals = async (req,res,next) => {
    try{
        if(req.user.role !== "user") return res.status(400).json({success:false, message:"Admin cannot use payRentals to prevent accidents, please use payRental instead"});
        const ObjectId = mongoose.Types.ObjectId;

        const price = await Rental.aggregate([{
            $match: {
              user: new ObjectId(req.user.id),
              isPaid: false
            }
          },
          {
            $lookup: {
              from: "cars",
              localField: "car",
              foreignField: "_id",
              as: "car"
            }},
            {$unwind: {
             path: "$car"
           }},
           {$group: {
             _id: "$user",
             totalprice: {$sum: {$toInt: "$car.pricerate"}}
            }}
        ]);
        const yourPrice = price[0].totalprice - 0;
        const balance = req.user.balance - 0;
        const balanceAfter = balance-yourPrice;

        if(balanceAfter < 0) return res.status(400).json({success:false, message:"Your balance is not enough to pay all unpaid rentals"});
        else {
            await Rental.updateMany(
                {user: new ObjectId(req.user.id), isPaid: false},
                {
                    $set: {isPaid: true}
                }
            )
            await User.findByIdAndUpdate(req.user.id,{balance: balanceAfter},{
                new:true,
                runValidators:true
            });
        }
        res.status(200).json({success:true, message:`Paid all unpaid rentals. Your current balance is ${balanceAfter}`});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,messege:"Cannot Pay Unpaid Rentals / You don't have any unpaid rentals"});
    }
};

//@Desc Pay one unpaid rental
//@route PUT /api/v1/rental/pay/:id
//@access Private
exports.payRental = async (req,res,next) => {
    try{
        const ObjectId = mongoose.Types.ObjectId;

        const rental = await Rental.findById(req.params.id);
        if(rental.user !== req.user.id && req.user.role !== "admin") return res.status(400).json({success:false, message:"You cannot pay someone else's rental"});
        if(rental.isPaid) return res.status(400).json({success:false,messege:"You've already paid this rental"});

        const balance = req.user.balance - 0;
        const price = await Rental.aggregate([{
            $match: {
              _id: new ObjectId(req.params.id),
            }
          },
          {
            $lookup: {
              from: "cars",
              localField: "car",
              foreignField: "_id",
              as: "car"
            }},
            {$unwind: {
             path: "$car"
           }},
           {$group: {
             _id: "$_id",
             price: {$sum : {$toInt: "$car.pricerate"}}
            }}
        ]);
        const thePrice = price[0].price - 0;
        const balanceAfter = balance-thePrice;

        if(balanceAfter < 0) return res.status(400).json({success:false, message:"Your balance is not enough to pay this rental"});
        else {
            await Rental.updateOne(
                {_id: new ObjectId(req.params.id)},
                {
                    $set: {isPaid: true}
                }
            )
            await User.findByIdAndUpdate(req.user.id,{balance: balanceAfter},{
                new:true,
                runValidators:true
            });
        }
        res.status(200).json({success:true, message:`Paid this rental. Your current balance is ${balanceAfter}`});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,messege:"Cannot Pay Unpaid Rentals"});
    }
};
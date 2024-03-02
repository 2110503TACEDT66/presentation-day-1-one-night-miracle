const Rental =require('../models/Rental');
const Cars =require('../models/Cars');
//@desc Get all rentals
//@route GET /api/v1/rentals
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
//@route GET /api/v1/rentals/:id
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
        const available = car.status;
    
    if(!car){
        return res.status(400).json({success:false,messege:`No car with the id of ${req.params.carId}`});
    }
    if(available=="unavailable")
        return res.status(400).json({success:false, message:'This car is currently unavailable'});

    
    //add user Id to req.body
    req.body.user=req.user.id;
    
    //Check for existed rental
    const existedRental = await Rental.find({user:req.user.id});

    //if the user is not an admin, they can only create 3 rental.
    if(existedRental.length >= 3 && req.user.role !== 'admin'){
        return res.status(400).json({success:false,message:`Ther user with ID ${req.user.id}has already made 3 rental`});
    }
    
    const rental= await Rental.create(req.body);
    await Cars.findByIdAndUpdate(req.params.carId,{status: "unavailable"},{
        new:true,
        runValidators:true
    });
         res.status(200).json({
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

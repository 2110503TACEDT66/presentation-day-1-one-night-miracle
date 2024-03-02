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
            select:'carid model pricerate status'
        });
    }else {//If you are an admin , you can see all!
        if(req.params.carId){
            console.log(req.params.carId);
            query=Rental.find({car:req.params.carId}).populate({
                path:"car",
                select:"carid model pricerate status"
            });
        }else query =await Rental.find().populate({
            path:'car',
            select:'carid model pricerate status'
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
            select:'carid model pricerate status'
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

//@Desc Add appointment
//@route POST /api/v1/hospitals/:hospitalId/appointment
//@access Private
exports.addAppointment=async (req,res,next)=>{
    try{
        req.body.car=req.params.carid;

        const car=await Cars.findById(req.params.carid);
    
    if(!car){
        return res.status(400).json({success:false,messege:`No car with the id of ${req.params.carid}`});
    }

    
    //add user Id to req.body
    req.body.user=req.user.id;
    
    //Check for existed appointment
    const existedRental = await Rental.find({user:req.user.id});

    //if the user is not an admin, they can only create 3 rental.
    if(existedRental.length >= 3 && req.user.role !== 'admin'){
        return res.status(400).json({success:false,message:`Ther user with ID ${req.user.id}has already made 3 appointments`});
    }
    
    const rental= await Rental.create(req.body);
         res.status(200).json({
            success:true,
            data:rental
         });
}catch(error){
    console.log(error);
    return res.status(500).json({success:false,message:"Cannot create Rental"});
}};


//@Desc Update appointment
//@route PUT /api/v1/appointment/:id
//@access Private
exports.updateAppointment=async (req,res,next)=>{
try{
    let appointment = await Appointment.findById(req.params.id);
    
    if(!appointment){
        return res.status(404).json({success:false,messege:`No appointment with the id of ${req.params.id}`});
    }

    //Make sure user is the appointment owner
    if(appointment.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
    }

    appointment=await Appointment.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data:appointment
    });
}catch(error){
    console.log(error);
    return res.status(500).json({success:false,messege:"Cannot update Appointment"});
}
};

//@Desc Delete appointment
//@route DELETE /api/v1/appointment/:id
//@access Private
exports.deleteAppointment=async (req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id);
        
        if(!appointment){
            return res.status(404).json({success:false,messege:`No appointment with the id of ${req.params.id}`});
        }
     //Make sure user is the appointment owner
     if(appointment.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`});
    }

        await appointment.deleteOne();
    
        res.status(200).json({
            success:true,
            data:{}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,messege:"Cannot update Appointment"});
    }
    };

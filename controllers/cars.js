const Cars = require('../models/Cars');
const Hospital = require('../models/Hospital');
//@desc GET all cars
//@route GET /api/v1/cars
//@access Public
exports.getHospitals=async(req,res,next)=>{
    
    let query;

    //Copy req.query
    const reqQuery={...req.query};
    
    //fields to exclude 
    const removeFields=['select','sort','page','limit'];

    //loop over remove fields and delete them from query
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string 

    let queryStr=JSON.stringify(reqQuery);
    queryStr =queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    //finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate(`appointments`);

    //Select Fields
    if(req.query.select){
        const fields =req.query.select.split(',').join(' ');
        query=query.select(fields);
    }
    //sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else {
        query=query.sort('-createdAt');
 }

   //Pagination
   const page=parseInt(req.query.page,10)||1;
   const limit=parseInt(req.query.limit,10)||25;
   const startIndex=(page-1)*limit;
   const endIndex =page*limit;
   
    try{
        const total =await Hospital.countDocuments();
        query=query.skip(startIndex).limit(limit);
        //Execute query

        const hospitals=await query;
       
       //Pagination result
       const pagination={};

       if(endIndex<total){
        pagination.next={
            page:page+1,limit
        }
       }
       if(startIndex>0){
        pagination.prev={
            page:page-1,limit
        }
       }


    //console.log(req.query);
    res.status(200).json({success:true,count:hospitals.length, data:hospitals});
}catch(err){
    
    res.status(400).json({success:false});
}
};

//@desc GET single car
//@route GET /api/v1/cars
//@access Public
exports.getHospital=async(req,res,next)=>{
    try{
        const hospital= await Hospital.findById(req.params.id);
if(!hospital){
    return res.status(400).json({success:false});
}
    
    res.status(200).json({success:true,data:hospital});
}catch(err){
    res.status(400).json({success:false});
}
};

//@desc Create  car
//@route POST /api/v1/cars
//@access Private
exports.createHospitals=async(req,res,next)=>{
    const hospital =await Hospital.create(req.body);
    res.status(201).json({success:true,data:hospital});
};

//@desc Update single car
//@route PUT /api/v1/cars/:id
//@access Private
exports.updateCar=async(req,res,next)=>{
    try{
        const car = await Cars.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        if(!car){
            return res.status(400).json({success:false});
        }
     res.status(200).json({success:true, data: hospital });
    }catch(err){
        res.status(400).json({success:false});
    }  
};

//@desc Delete single car
//@route DELETE /api/v1/cars/:id
//@access Private
exports.deleteCar=async(req,res,next)=>{
    try{
        const car= await Cars.findById(req.params.id);

        if(!car)
         res.status(400).json({success:false});
        
        await car.deleteOne();

    res.status(200).json({success:true,data: {}});
}catch(err){
    res.status(400).json({success:false});
}
};

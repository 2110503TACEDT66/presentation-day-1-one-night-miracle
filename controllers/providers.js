const Providers = require('../models/Providers')

//@desc GET all providers
//@route GET /api/v1/providers
//@access Public
exports.getProviders=async(req,res,next)=>{
    try{
        const provider = await Providers.find();
    if(!provider){
        return res.status(400).json({success:false});
    }
    res.status(200).json({success:true,data:provider});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Create provider
//@route POST /api/v1/providers
//@access Private
exports.createProviders = async(req,res,next)=>{
    const provider = await Providers.create(req.body);
    res.status(201).json({success:true,data:provider});
};
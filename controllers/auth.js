const User = require('../models/User');

//@desc Register user
//@route POST /api/v1/auth/register
//@access public
exports.register = async(req,res,next)=>{
try{
    const {name,telephoneNumber,email,password,role}=req.body;
    //create user
    const user =await User.create({
        name,
        telephoneNumber,
        email,
        password,
        role
    });
    //create token
    //const token=user.getSignedJwtToken();
    //res.status(200).json({success:true,token});
    sendTokenResponse(user,200,res);

}catch(err){
    res.status(400).json({success:false});
    console.log(err.stack);
 } 
};

//Get token from model,create cookie and send response
const sendTokenResponse=(user,statusCode,res)=>{
    //Create token
    const token=user.getSignedJwtToken();

    const options ={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        _id:user.id,
        name:user.name,
        telephoneNumber:user.telephoneNumber,
        email:user.email,
        role:user.role,
        balance:user.balance,
        token
    })
}

//@desc Login user
//@route POST/api/v1/auth/login
//@access Public
exports.login=async (req,res,next)=>{
    const {email,password}=req.body;

   //Validate email & password
   if(!email || !password){
    return res.status(400).json({success:false,msg:'Please provide an email and password'});
   }
  //check for user
  const user  = await
  User.findOne({email}).select('+password');
  
  if(!user){
    return res.status(400).json({success:false,msg:'Invalid credentials'});
  }
  //check if password matches
   const isMatch =await user.matchPassword(password);

   if(!isMatch){
    return res.status(400).json({success:false,msg:'Invalid credentials'});
   }
   //Create token 
   //const token =user.getSignedJwtToken();
   //res.status(200).json({success:true,token});
   sendTokenResponse(user,200,res);
};

//At the end of file
//@desc Get current Logged in  user
//@route POST /api/v1/auth/me
//@access Private
exports.getMe=async(req,res,next)=>{
    const user=await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    });
};

//@desc Add provided number to balance
//@route PUT /api/v1/auth/balance
//@access Private
exports.addBalance=async(req,res,next)=>{
    const balance = req.user.balance - 0;
    const add = req.body.balance - 0;
    const balanceAfter = balance+add;

    const user = await User.findByIdAndUpdate(req.user.id,{balance: balanceAfter},{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data: user
    });
};

//@desc - Logout user / clear token
//@route - GET /api/v1/auth/logout
//@access - Private

exports.logout = async (req,res,next) => {
    res.cookie('token','none',{
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({success:true, data:{}});
}
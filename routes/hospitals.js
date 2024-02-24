const express = require('express');
const {getHospitals,getHospital,createHospitals,updateHospital,deleteHospital} = require('../controllers/hospitals');

//Include other routers
const appointmentsRouter=require('./appointments');
const router =express.Router();  //สร้างมาจาก express

const {protect,authorize}=require('../middleware/auth');


//Re-route into other resource routers
router.use('/:hospitalId/appointments/',appointmentsRouter);

router.route('/').get(getHospitals).post(protect,authorize('admin'),createHospitals);
router.route('/:id').get(getHospital).put(protect,authorize('admin'),updateHospital).delete(protect,authorize('admin'),deleteHospital);    
module.exports=router; //export routerให้ไฟล์อื่นรุ้จัก    
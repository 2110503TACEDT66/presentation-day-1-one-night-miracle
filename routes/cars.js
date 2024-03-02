const express = require('express');
const {getCars,getCar,createCars,updateCar,deleteCar} = require('../controllers/cars');

//Include other routers
const rentalRouter=require('./rental');
const router =express.Router();  //สร้างมาจาก express

const {protect,authorize}=require('../middleware/auth');


//Re-route into other resource routers
router.use('/:carId/rental/',rentalRouter);

router.route('/').get(getHospitals).post(protect,authorize('admin'),createHospitals);
router.route('/:id').get(getHospital).put(protect,authorize('admin'),updateHospital).delete(protect,authorize('admin'),deleteHospital);    
module.exports=router; //export routerให้ไฟล์อื่นรุ้จัก    
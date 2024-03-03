const express=require('express');
const {getRentals,getRental,createRental,updateRental,deleteRental,payRentals,payRental}=require('../controllers/rental');

const router =express.Router({mergeParams:true});

const {protect,authorize}=require('../middleware/auth');

router.route('/')
.get(protect,getRentals)
.post(protect,authorize('admin','user'),createRental);
router.route('/pay').put(protect,payRentals);
router.route('/pay/:id').put(protect,payRental)
router.route('/:id')
.get(protect,getRental)
.put(protect,authorize('admin','user'),updateRental)
.delete(protect,authorize('admin','user'),deleteRental);
module.exports=router;
const express = require('express')
const {getProviders, createProviders} = require('../controllers/providers')

const router = express.Router();

const {protect,authorize}=require('../middleware/auth');

router.route('/').get(getProviders).post(protect, authorize('admin'), createProviders)

module.exports = router;
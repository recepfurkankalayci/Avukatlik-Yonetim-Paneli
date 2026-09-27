const express = require('express');
const router = express.Router();
const paymentAgreementController = require('../controllers/paymentAgreementController');
const verifyToken = require('../middlewares/authMiddlewares');

router.get('/', verifyToken, paymentAgreementController.getAgreements);
router.post('/', verifyToken, paymentAgreementController.createAgreement);
router.get('/:id', verifyToken, paymentAgreementController.getAgreementById);

module.exports = router;

const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const verifyToken = require('../middlewares/authMiddlewares');

router.get('/', verifyToken, collectionController.getCollections);
router.post('/', verifyToken, collectionController.createCollection);
router.get('/:id', verifyToken, collectionController.getCollectionById);

// Makbuz Ekleme Rotası
router.post('/:id/receipt', verifyToken, collectionController.createReceipt);

module.exports = router;

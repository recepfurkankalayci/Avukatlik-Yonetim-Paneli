const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const verifyToken = require('../middlewares/authMiddlewares');

router.get('/', verifyToken, clientController.getClients);
router.post('/', verifyToken, clientController.createClient);
router.get('/:id', verifyToken, clientController.getClientById);

module.exports = router;

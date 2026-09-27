const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middlewares/authMiddlewares');

router.get('/', verifyToken, expenseController.getExpenses);
router.post('/', verifyToken, expenseController.createExpense);
router.get('/:id', verifyToken, expenseController.getExpenseById);

module.exports = router;

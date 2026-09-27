const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const verifyToken = require('../middlewares/authMiddlewares');
const { isAdmin } = require('../middlewares/roleMiddlewares');

router.post('/', verifyToken, isAdmin, employeeController.createEmployee);
router.get('/', verifyToken, isAdmin, employeeController.getAllEmployees);
router.put('/:id', verifyToken, isAdmin, employeeController.updateEmployee);
router.patch('/:id/deactivate', verifyToken, isAdmin, employeeController.deactivateEmployee);
router.patch('/:id/password', verifyToken, isAdmin, employeeController.updatePassword);
router.get('/:id', verifyToken, employeeController.getEmployeeById);
// router.get('/:id/assigned-clients', verifyToken, employeeController.getAssignedClients);
module.exports = router;

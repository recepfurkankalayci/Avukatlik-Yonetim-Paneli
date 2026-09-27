const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const verifyToken = require('../middlewares/authMiddlewares');
const { isAdmin } = require('../middlewares/roleMiddlewares');

// Tüm rotalar verifyToken ve isAdmin bekçileriyle korunur
router.get('/', verifyToken, isAdmin, departmentController.getAllDepartments);
router.post('/', verifyToken, isAdmin, departmentController.createDepartment);
router.put('/:id', verifyToken, isAdmin, departmentController.updateDepartment);

// Hard delete yerine aktif/pasif toggle (Madde 2)
router.patch('/:id/toggle-status', verifyToken, isAdmin, departmentController.toggleStatus);

// Departmana çalışan atama (Madde 3)
router.post('/:id/employees', verifyToken, isAdmin, departmentController.assignEmployee);

module.exports = router;

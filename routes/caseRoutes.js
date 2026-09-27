const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const verifyToken = require('../middlewares/authMiddlewares');
const { isAdmin } = require('../middlewares/roleMiddlewares');

router.get('/', verifyToken, caseController.getCases);
router.post('/', verifyToken, caseController.createCase);
router.get('/:id', verifyToken, caseController.getCaseById);

router.patch('/:id/status', verifyToken, caseController.updateStatus);
router.get('/:id/assignable-employees', verifyToken, isAdmin, caseController.getAssignableEmployees);
router.post('/:id/lawyers', verifyToken, isAdmin, caseController.assignLawyer);
router.delete('/:id/lawyers/:employeeId', verifyToken, isAdmin, caseController.removeLawyer);

module.exports = router;
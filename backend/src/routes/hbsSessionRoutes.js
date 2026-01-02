const express = require('express');
const router = express.Router();
const hbsSessionController = require('../controllers/hbsSessionController');

router.get('/group/:groupId', hbsSessionController.getSessionsByGroup);
router.post('/', hbsSessionController.createSession);
router.patch('/:id', hbsSessionController.updateSession);
router.delete('/:id', hbsSessionController.deleteSession);

// Attendance
router.get('/:id/attendance', hbsSessionController.getAttendance);
router.post('/:id/attendance', hbsSessionController.recordAttendance);

module.exports = router;

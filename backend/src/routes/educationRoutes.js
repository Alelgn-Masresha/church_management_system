const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');

router.get('/user/:userId', educationController.getEducationByUser);
router.post('/', educationController.createEducation);
router.patch('/:id', educationController.updateEducation);
router.delete('/:id', educationController.deleteEducation);

module.exports = router;

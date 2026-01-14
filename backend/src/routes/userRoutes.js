const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.post('/batch/update', userController.batchUpdateUsers);

router.delete('/:id', userController.deleteUser);

module.exports = router; 

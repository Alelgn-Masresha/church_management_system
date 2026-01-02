const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');

// Get all children for a parent
router.get('/parent/:parentId', childController.getChildrenByParent);

// Create a new child
router.post('/', childController.createChild);

// Update a child
router.patch('/:id', childController.updateChild);

// Delete a child
router.delete('/:id', childController.deleteChild);

module.exports = router;

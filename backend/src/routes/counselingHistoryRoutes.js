const express = require('express');
const router = express.Router();
const counselingHistoryController = require('../controllers/counselingHistoryController');

router.get('/counselee/:counseleeId', counselingHistoryController.getHistoryByCounselee);
router.post('/', counselingHistoryController.createHistory);
router.patch('/:id', counselingHistoryController.updateHistory);
router.delete('/:id', counselingHistoryController.deleteHistory);

module.exports = router;

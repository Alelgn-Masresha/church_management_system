const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');

router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.patch('/:id', zoneController.updateZone);
router.delete('/:id', zoneController.deleteZone);

module.exports = router;

const Zone = require('../models/Zone');

exports.getAllZones = async (req, res) => {
    try {
        const zones = await Zone.findAll();
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getZoneById = async (req, res) => {
    try {
        const zone = await Zone.findById(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.json(zone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createZone = async (req, res) => {
    try {
        const newZone = await Zone.create(req.body);
        res.status(201).json(newZone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateZone = async (req, res) => {
    try {
        const updatedZone = await Zone.update(req.params.id, req.body);
        if (!updatedZone) return res.status(404).json({ message: 'Zone not found' });
        res.json(updatedZone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteZone = async (req, res) => {
    try {
        const deleted = await Zone.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Zone not found' });
        res.json({ message: 'Zone deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

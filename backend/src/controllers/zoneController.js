const Zone = require('../models/Zone');

exports.getAllZones = async (req, res) => {
    try {
        const zones = await Zone.findAll();
        res.json(zones);
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

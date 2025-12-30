const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const newGroup = await Group.create(req.body);
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

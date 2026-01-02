const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.json(group);
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

exports.updateGroup = async (req, res) => {
    try {
        const updatedGroup = await Group.update(req.params.id, req.body);
        if (!updatedGroup) return res.status(404).json({ message: 'Group not found' });
        res.json(updatedGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const deleted = await Group.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Group not found' });
        res.json({ message: 'Group deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const Child = require('../models/Child');

exports.getChildrenByParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        const children = await Child.findAllByParent(parentId);
        res.json(children);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createChild = async (req, res) => {
    try {
        const newChild = await Child.create(req.body);
        res.status(201).json(newChild);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateChild = async (req, res) => {
    try {
        const updatedChild = await Child.update(req.params.id, req.body);
        if (!updatedChild) {
            return res.status(404).json({ message: 'Child not found or no changes made' });
        }
        res.json(updatedChild);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteChild = async (req, res) => {
    try {
        const deleted = await Child.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Child not found' });
        }
        res.json({ message: 'Child deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

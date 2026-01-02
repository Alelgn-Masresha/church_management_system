const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.update(req.params.id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.batchUpdateUsers = async (req, res) => {
    try {
        const updates = req.body; // Expects array of { id, data }
        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: 'Request body must be an array of updates' });
        }

        const promises = updates.map(u => User.update(u.id, u.data));
        const results = await Promise.all(promises);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

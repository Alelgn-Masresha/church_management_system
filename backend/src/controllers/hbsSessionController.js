const HBSSession = require('../models/HBSSession');

exports.getSessionsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const sessions = await HBSSession.findAllByGroup(groupId);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSession = async (req, res) => {
    try {
        const newSession = await HBSSession.create(req.body);
        res.status(201).json(newSession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const updatedSession = await HBSSession.update(req.params.id, req.body);
        if (!updatedSession) {
            return res.status(404).json({ message: 'Session not found or no changes made' });
        }
        res.json(updatedSession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const deleted = await HBSSession.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json({ message: 'Session deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await HBSSession.getAttendance(req.params.id);
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recordAttendance = async (req, res) => {
    try {
        // Body should be array of { memberId, isPresent }
        const result = await HBSSession.recordAttendance(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

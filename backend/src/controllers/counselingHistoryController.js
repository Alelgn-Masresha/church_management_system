const CounselingHistory = require('../models/CounselingHistory');

exports.getHistoryByCounselee = async (req, res) => {
    try {
        const { counseleeId } = req.params;
        const history = await CounselingHistory.findAllByCounselee(counseleeId);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createHistory = async (req, res) => {
    try {
        const newRecord = await CounselingHistory.create(req.body);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateHistory = async (req, res) => {
    try {
        const updatedRecord = await CounselingHistory.update(req.params.id, req.body);
        if (!updatedRecord) {
            return res.status(404).json({ message: 'Record not found or no changes made' });
        }
        res.json(updatedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const deleted = await CounselingHistory.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

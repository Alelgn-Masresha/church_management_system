const EducationHistory = require('../models/EducationHistory');

exports.getEducationByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const education = await EducationHistory.findAllByUser(userId);
        res.json(education);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEducation = async (req, res) => {
    try {
        const newEdu = await EducationHistory.create(req.body);
        res.status(201).json(newEdu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEducation = async (req, res) => {
    try {
        const updatedEdu = await EducationHistory.update(req.params.id, req.body);
        if (!updatedEdu) {
            return res.status(404).json({ message: 'Record not found or no changes made' });
        }
        res.json(updatedEdu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEducation = async (req, res) => {
    try {
        const deleted = await EducationHistory.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

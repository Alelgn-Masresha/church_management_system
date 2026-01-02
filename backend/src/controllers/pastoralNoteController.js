const PastoralNote = require('../models/PastoralNote');

exports.getNotesByMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const notes = await PastoralNote.findAllByMember(memberId);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createNote = async (req, res) => {
    try {
        const newNote = await PastoralNote.create(req.body);
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const updatedNote = await PastoralNote.update(req.params.id, req.body);
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found or no changes made' });
        }
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const deleted = await PastoralNote.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully', id: deleted.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

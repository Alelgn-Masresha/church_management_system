const express = require('express');
const router = express.Router();
const pastoralNoteController = require('../controllers/pastoralNoteController');

router.get('/member/:memberId', pastoralNoteController.getNotesByMember);
router.get('/recent', pastoralNoteController.getRecentNotes);
router.post('/', pastoralNoteController.createNote);
router.patch('/:id', pastoralNoteController.updateNote);
router.delete('/:id', pastoralNoteController.deleteNote);

module.exports = router;

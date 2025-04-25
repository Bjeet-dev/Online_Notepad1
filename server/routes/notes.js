const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// @route   GET /api/notes
// @desc    Get all notes for a user
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ lastModified: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({
      title,
      content,
      tags,
      user: req.user.id
    });
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags || note.tags;
    note.lastModified = Date.now();

    await note.save();
    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await note.remove();
    res.json({ message: 'Note removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/search
// @desc    Search notes
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    const notes = await Note.find({
      $and: [
        { user: req.user.id },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).sort({ lastModified: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id/export
// @desc    Export note to PDF
router.get('/:id/export', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Create PDF
    const doc = new PDFDocument();
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${note.title}.pdf`);
      res.send(pdfData);
    });

    // Add content to PDF
    doc.fontSize(20).text(note.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(note.content);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const { submitProof, getMyProofs, getPendingProofs, reviewProof } = require('../controllers/skillProofController');

// Multer config for proof file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `proof_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname || mimetype) return cb(null, true);
    cb(new Error('Only images and documents allowed'));
  },
});

router.post('/', authenticate, upload.single('file'), submitProof);
router.get('/my-proofs', authenticate, getMyProofs);
router.get('/pending', authenticate, authorize('admin'), getPendingProofs);
router.patch('/:id/review', authenticate, authorize('admin'), reviewProof);

module.exports = router;

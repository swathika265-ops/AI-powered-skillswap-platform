const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createRoadmap, getMyRoadmaps, getRoadmapById, completeStage } = require('../controllers/roadmapController');

router.post('/', authenticate, createRoadmap);
router.get('/', authenticate, getMyRoadmaps);
router.get('/:id', authenticate, getRoadmapById);
router.patch('/:id/stage/:stageIndex/complete', authenticate, completeStage);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSkills, getCategories, createSkill, addLearningSkill, addTeachingSkill, getMySkills, getSkillById } = require('../controllers/skillController');

router.get('/', getSkills);
router.get('/categories', getCategories);
router.get('/my-skills', authenticate, getMySkills);
router.post('/add-learning', authenticate, addLearningSkill);
router.post('/add-teaching', authenticate, addTeachingSkill);
router.post('/', authenticate, authorize('admin'), createSkill);
router.get('/:id', getSkillById);

module.exports = router;

const LearningRoadmap = require('../models/LearningRoadmap');
const Skill = require('../models/Skill');

// Helper: generate rule-based roadmap
const generateRuleBasedRoadmap = (skill, currentLevel, targetLevel, weeklyHours) => {
  const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  const curr = levels[currentLevel] || 1;
  const target = levels[targetLevel] || 3;
  const stageCount = Math.max(1, (target - curr) * 2);
  const stages = [];

  for (let i = 0; i < stageCount; i++) {
    stages.push({
      title: `Stage ${i + 1}: ${i === 0 ? 'Foundations' : i === stageCount - 1 ? 'Mastery' : `Intermediate ${i}`}`,
      description: `Learn key concepts of ${skill.name} at this stage.`,
      topics: [`${skill.name} concept ${i + 1}`, `Practice exercises`, `Mini project planning`],
      exercises: [`Exercise ${i + 1}A: Hands-on practice`, `Exercise ${i + 1}B: Apply concepts`],
      miniProject: `Build a small project demonstrating Stage ${i + 1} skills.`,
      estimatedHours: Math.max(5, weeklyHours * 2),
      order: i + 1,
      isCompleted: false,
    });
  }

  return { stages, estimatedWeeks: Math.ceil(stageCount * 2) };
};

// POST /api/roadmaps
const createRoadmap = async (req, res, next) => {
  try {
    const { skillId, currentLevel, targetLevel, weeklyHours, preferredLanguage, goals } = req.body;
    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    // Generate rule-based roadmap (AI integration would go here)
    const { stages, estimatedWeeks } = generateRuleBasedRoadmap(skill, currentLevel, targetLevel, weeklyHours || 5);

    const roadmap = await LearningRoadmap.create({
      userId: req.user._id, skillId, title: `${skill.name} Learning Roadmap`,
      currentLevel, targetLevel, weeklyHours: weeklyHours || 5,
      preferredLanguage: preferredLanguage || 'English', goals,
      stages, estimatedWeeks, generatedBy: 'rule_based',
    });

    res.status(201).json({ success: true, data: roadmap });
  } catch (error) { next(error); }
};

// GET /api/roadmaps
const getMyRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await LearningRoadmap.find({ userId: req.user._id, isActive: true }).populate('skillId', 'name category');
    res.json({ success: true, data: roadmaps });
  } catch (error) { next(error); }
};

// GET /api/roadmaps/:id
const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id }).populate('skillId');
    if (!roadmap) return res.status(404).json({ success: false, error: 'Roadmap not found' });
    res.json({ success: true, data: roadmap });
  } catch (error) { next(error); }
};

// PATCH /api/roadmaps/:id/stage/:stageIndex/complete
const completeStage = async (req, res, next) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, error: 'Roadmap not found' });

    const idx = parseInt(req.params.stageIndex);
    if (idx < 0 || idx >= roadmap.stages.length) return res.status(400).json({ success: false, error: 'Invalid stage' });

    roadmap.stages[idx].isCompleted = true;
    roadmap.stages[idx].completedAt = new Date();

    const completedCount = roadmap.stages.filter(s => s.isCompleted).length;
    roadmap.overallProgress = Math.round((completedCount / roadmap.stages.length) * 100);
    await roadmap.save();

    res.json({ success: true, data: roadmap });
  } catch (error) { next(error); }
};

module.exports = { createRoadmap, getMyRoadmaps, getRoadmapById, completeStage };

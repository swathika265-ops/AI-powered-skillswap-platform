const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');

// GET /api/skills
const getSkills = async (req, res, next) => {
  try {
    const { search, category, difficulty, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }];

    const skills = await Skill.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Skill.countDocuments(query);
    res.json({ success: true, data: skills, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// GET /api/skills/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Skill.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

// POST /api/skills (admin)
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, difficulty, tags } = req.body;
    const skill = await Skill.create({ name, category, description, difficulty, tags, createdBy: req.user._id });
    res.status(201).json({ success: true, data: skill });
  } catch (error) { next(error); }
};

// POST /api/skills/add-learning
const addLearningSkill = async (req, res, next) => {
  try {
    const { skillId, proficiencyLevel, targetLevel, goals } = req.body;

    let finalSkillId = skillId;
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      let skill = await Skill.findOne({ name: { $regex: new RegExp('^' + skillId + '$', 'i') } });
      if (!skill) {
        skill = await Skill.create({ name: skillId, category: 'General', createdBy: req.user._id });
      }
      finalSkillId = skill._id;
    }
    const skill = await Skill.findById(finalSkillId);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    const existing = await UserSkill.findOne({ userId: req.user._id, skillId: finalSkillId, type: 'learning' });
    if (existing) return res.status(409).json({ success: false, error: 'Skill already added' });

    const userSkill = await UserSkill.create({
      userId: req.user._id, skillId: finalSkillId, type: 'learning', proficiencyLevel, targetLevel, goals, status: 'learning_interest',
    });
    res.status(201).json({ success: true, data: userSkill });
  } catch (error) { next(error); }
};

// POST /api/skills/add-teaching
const addTeachingSkill = async (req, res, next) => {
  try {
    const { skillId, proficiencyLevel } = req.body;

    let finalSkillId = skillId;
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      let skill = await Skill.findOne({ name: { $regex: new RegExp('^' + skillId + '$', 'i') } });
      if (!skill) {
        skill = await Skill.create({ name: skillId, category: 'General', createdBy: req.user._id });
      }
      finalSkillId = skill._id;
    }
    const skill = await Skill.findById(finalSkillId);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    const existing = await UserSkill.findOne({ userId: req.user._id, skillId: finalSkillId, type: 'teaching' });
    if (existing) return res.status(409).json({ success: false, error: 'Teaching skill already added' });

    // Status starts as proofs_pending — NOT verified
    const userSkill = await UserSkill.create({
      userId: req.user._id, skillId: finalSkillId, type: 'teaching', proficiencyLevel, status: 'proofs_pending',
    });
    res.status(201).json({ success: true, data: userSkill });
  } catch (error) { next(error); }
};

// GET /api/skills/my-skills
const getMySkills = async (req, res, next) => {
  try {
    const skills = await UserSkill.find({ userId: req.user._id }).populate('skillId');
    const learning = skills.filter(s => s.type === 'learning');
    const teaching = skills.filter(s => s.type === 'teaching');
    res.json({ success: true, data: { learning, teaching } });
  } catch (error) { next(error); }
};

// GET /api/skills/:id
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (error) { next(error); }
};

module.exports = { getSkills, getCategories, createSkill, addLearningSkill, addTeachingSkill, getMySkills, getSkillById };

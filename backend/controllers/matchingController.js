const UserSkill = require('../models/UserSkill');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');

const getSetting = async (key, defaultVal) => {
  const s = await PlatformSettings.findOne({ key });
  return s ? s.value : defaultVal;
};

// POST /api/matching/find
const findMatches = async (req, res, next) => {
  try {
    const { skillId, language, availability } = req.body;
    const userId = req.user._id;

    // Find verified mentors for this skill — ONLY verified status
    const verifiedMentors = await UserSkill.find({ skillId, type: 'teaching', status: 'verified' }).populate('userId');

    if (verifiedMentors.length === 0) {
      return res.json({ success: true, data: [], message: 'No verified mentors found for this skill' });
    }

    // Get weights from settings
    const skillWeight = await getSetting('matching_skill_relevance_weight', 35);
    const profWeight = await getSetting('matching_proficiency_weight', 20);
    const langWeight = await getSetting('matching_language_weight', 15);
    const availWeight = await getSetting('matching_availability_weight', 15);
    const reliabilityWeight = await getSetting('matching_reliability_weight', 15);

    const learnerProfile = await User.findById(userId);
    const learnerLangs = (learnerProfile.languages || []).map(l => l.toLowerCase());

    const scored = [];
    for (const mentorSkill of verifiedMentors) {
      const mentor = mentorSkill.userId;
      if (!mentor || mentor._id.toString() === userId.toString()) continue;
      if (mentor.status !== 'active') continue;

      // Skill relevance (verified = full score)
      const skillScore = 100;

      // Proficiency compatibility
      const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      const mentorLevel = levels[mentorSkill.proficiencyLevel] || 2;
      const profScore = Math.min(mentorLevel * 25, 100);

      // Language compatibility
      const mentorLangs = (mentor.languages || []).map(l => l.toLowerCase());
      const commonLangs = learnerLangs.filter(l => mentorLangs.includes(l));
      const langScore = commonLangs.length > 0 ? Math.min(commonLangs.length * 50, 100) : 0;

      // Availability placeholder
      const availScore = 70;

      // Reliability from reputation and ratings
      const reliabilityScore = Math.round((mentor.reputationScore + (mentor.averageRating * 20)) / 2);

      // Weighted total
      const total = Math.round(
        (skillScore * skillWeight + profScore * profWeight + langScore * langWeight +
          availScore * availWeight + reliabilityScore * reliabilityWeight) / 100
      );

      scored.push({
        mentor: { _id: mentor._id, name: mentor.name, profileImage: mentor.profileImage, bio: mentor.bio,
          languages: mentor.languages, averageRating: mentor.averageRating, totalRatings: mentor.totalRatings,
          completedSessions: mentor.completedSessions, reputationScore: mentor.reputationScore },
        skill: { proficiencyLevel: mentorSkill.proficiencyLevel, verifiedAt: mentorSkill.verifiedAt },
        matchScore: total,
        breakdown: {
          skillRelevance: { score: skillScore, weight: skillWeight },
          proficiency: { score: profScore, weight: profWeight },
          language: { score: langScore, weight: langWeight, commonLanguages: commonLangs },
          availability: { score: availScore, weight: availWeight },
          reliability: { score: reliabilityScore, weight: reliabilityWeight },
        },
      });
    }

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ success: true, data: scored.slice(0, 20) });
  } catch (error) { next(error); }
};

module.exports = { findMatches };

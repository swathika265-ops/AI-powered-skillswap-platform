const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const config = require('../config');

/**
 * Seeds the database with an initial admin user and default platform settings.
 * Only creates if they don't already exist.
 */
const seedDatabase = async () => {
  try {
    // Seed admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Platform Admin',
        email: config.admin.email,
        password: config.admin.password,
        role: 'admin',
        status: 'active',
        bio: 'SkillSwap Platform Administrator',
        languages: ['English'],
        creditBalance: 0,
        reputationScore: 100,
      });
      console.log(`✅ Admin user seeded: ${config.admin.email}`);
    }

    // Seed default platform settings
    const defaultSettings = [
      {
        key: 'assessment_pass_percentage',
        value: config.assessment.defaultPassPercentage,
        description: 'Minimum percentage required to pass a skill assessment',
        category: 'assessment',
      },
      {
        key: 'assessment_max_violations',
        value: config.assessment.defaultMaxViolations,
        description: 'Maximum tab-switch/visibility violations before auto-fail',
        category: 'assessment',
      },
      {
        key: 'assessment_max_attempts',
        value: config.assessment.defaultMaxAttempts,
        description: 'Maximum assessment attempts per skill',
        category: 'assessment',
      },
      {
        key: 'assessment_cooldown_hours',
        value: config.assessment.defaultCooldownHours,
        description: 'Hours to wait between assessment retakes',
        category: 'assessment',
      },
      {
        key: 'matching_skill_relevance_weight',
        value: 35,
        description: 'Weight for skill relevance in matching algorithm (%)',
        category: 'matching',
      },
      {
        key: 'matching_proficiency_weight',
        value: 20,
        description: 'Weight for proficiency compatibility in matching (%)',
        category: 'matching',
      },
      {
        key: 'matching_language_weight',
        value: 15,
        description: 'Weight for language compatibility in matching (%)',
        category: 'matching',
      },
      {
        key: 'matching_availability_weight',
        value: 15,
        description: 'Weight for availability overlap in matching (%)',
        category: 'matching',
      },
      {
        key: 'matching_reliability_weight',
        value: 15,
        description: 'Weight for reliability and ratings in matching (%)',
        category: 'matching',
      },
      {
        key: 'starter_credits',
        value: 3,
        description: 'Credits awarded to new users upon registration',
        category: 'credits',
      },
      {
        key: 'min_proofs_required',
        value: 2,
        description: 'Minimum distinct proofs required per teaching skill',
        category: 'assessment',
      },
    ];

    for (const setting of defaultSettings) {
      await PlatformSettings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('✅ Default platform settings seeded');

    // Seed challenges if empty
    const { Challenge } = require('../models/Challenge');
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await Challenge.create([
          {
            title: 'Mastering the Katana: Iaido Draw & Form Execution',
            description: 'Demonstrate fundamental stance (kamae), clean draw (nukitsuke), and precision form with proper balance and recovery.',
            difficulty: 'intermediate',
            rewardCredits: 5,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            guidelines: ['Record or write clean breakdown of core stances', 'Explain proper grip (tenouchi) and blade angle', 'Submit video or analysis link'],
            submissionType: 'link',
            isActive: true,
            createdBy: adminUser._id
          },
          {
            title: 'Python CLI Automation & Data Scraper',
            description: 'Build a production-ready Python command-line tool that extracts and structures data with error handling and unit tests.',
            difficulty: 'beginner',
            rewardCredits: 3,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            guidelines: ['Use requests or BeautifulSoup', 'Include requirements.txt and README', 'Write at least 3 pytest tests'],
            submissionType: 'github',
            isActive: true,
            createdBy: adminUser._id
          }
        ]);
        console.log('✅ Initial challenges seeded');
      }
    }
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};

module.exports = seedDatabase;

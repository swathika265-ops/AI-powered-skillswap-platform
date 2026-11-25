const PlatformSettings = require('../models/PlatformSettings');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// GET /api/admin/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.find().sort({ category: 1, key: 1 });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

// PUT /api/admin/settings/:key
const updateSetting = async (req, res, next) => {
  try {
    const { value } = req.body;
    const setting = await PlatformSettings.findOneAndUpdate(
      { key: req.params.key }, { value, updatedBy: req.user._id }, { returnDocument: 'after' }
    );
    if (!setting) return res.status(404).json({ success: false, error: 'Setting not found' });

    await AuditLog.create({ userId: req.user._id, action: 'SETTING_UPDATED', resource: 'PlatformSettings', resourceId: setting._id, details: { key: req.params.key, value } });
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
};

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};
    if (action) query.action = action;
    const logs = await AuditLog.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, data: logs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const reports = await Report.find(query).populate('reporterId', 'name email').populate('reportedUserId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
};

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { reportedUserId, type, referenceId, referenceModel, reason, details } = req.body;
    const report = await Report.create({ reporterId: req.user._id, reportedUserId, type, referenceId, referenceModel, reason, details });
    res.status(201).json({ success: true, data: report });
  } catch (error) { next(error); }
};

// PATCH /api/reports/:id/resolve (admin)
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    if (!['resolved', 'dismissed'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });

    const report = await Report.findByIdAndUpdate(req.params.id, { status, resolution, resolvedBy: req.user._id, resolvedAt: new Date() }, { returnDocument: 'after' });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    await Notification.create({ userId: report.reporterId, type: 'admin_action', title: 'Report Updated', message: `Your report has been ${status}.`, referenceId: report._id, referenceModel: 'Report' });

    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSetting, getAuditLogs, getReports, createReport, resolveReport };

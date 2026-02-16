const Reports = require('../../models/general_users/report.model');

const createReport = async (req, res) => {
  try {
    const report = await Reports.create(req.body);
    if (!report) return res.status(400).json('Report not created');
    res.status();
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Reports.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!report) return res.status(400).json('Report not updated');
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

module.exports = { createReport, updateReport };

const prisma = require('../../config/prisma');

const createReport = async (req, res) => {
  try {
    const report = await prisma.report.create({
      data: req.body,
    });
    if (!report) return res.status(400).json('Report not created');
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const updateReport = async (req, res) => {
  try {
    const existingReport = await prisma.report.findUnique({
      where: { id: req.params.id },
    });
    if (!existingReport) return res.status(400).json('Report not updated');
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

module.exports = { createReport, updateReport };

import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param } from '../../utils/request';

export const createReport = async (req: Request, res: Response) => {
  try {
    const report = await prisma.report.create({ data: req.body });
    if (!report) return res.status(400).json('Report not created');
    res.status(201).json(report);
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const id = param(req.params.id);
    const existingReport = await prisma.report.findUnique({ where: { id } });
    if (!existingReport) return res.status(400).json('Report not updated');
    const report = await prisma.report.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(report);
  } catch {
    res.status(500).json('Internal server error');
  }
};

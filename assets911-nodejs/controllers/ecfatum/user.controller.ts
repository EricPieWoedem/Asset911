import { Request, Response } from 'express';
import * as fs from 'fs';
import prisma from '../../config/prisma';

export const checkExistingUsers = async (req: Request, res: Response) => {
  try {
    const usersList = req.body as { phoneNumber: string }[];
    const resultsArray: { phoneNumber: string; status: string; name?: string }[] = [];
    const uniquePhoneNumbers = [...new Set(usersList.map((u) => u.phoneNumber))];
    for (const phoneNumber of uniquePhoneNumbers) {
      const foundUser = await prisma.user.findFirst({ where: { phoneNumber } });
      if (foundUser) {
        resultsArray.push({ phoneNumber, status: 'Found', name: foundUser?.name ?? undefined });
      } else {
        resultsArray.push({ phoneNumber, status: 'Not Found' });
      }
    }
    fs.writeFileSync('./results.json', JSON.stringify(resultsArray));
    res.status(200).json('Results saved');
  } catch {
    res.status(500).json('Internal server error');
  }
};

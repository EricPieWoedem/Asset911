const fs = require('fs');
const prisma = require('../../config/prisma');

const checkExistingUsers = async (req, res) => {
  try {
    const usersList = req.body;
    const resultsArray = [];
    const uniquePhoneNumbers = [
      ...new Set(usersList.map(user => user.phoneNumber)),
    ];
    const uniquePhoneNumbersArray = [...uniquePhoneNumbers].map(
      phoneNumber => ({ phoneNumber: phoneNumber })
    );

    for (const user of uniquePhoneNumbersArray) {
      const phoneNumber = user.phoneNumber;
      const foundUser = await prisma.user.findFirst({ where: { phoneNumber } });
      if (foundUser) {
        resultsArray.push({
          phoneNumber,
          status: 'Found',
          name: foundUser?.name,
        });
      } else {
        resultsArray.push({
          phoneNumber,
          status: 'Not Found',
        });
      }
    }

    fs.writeFileSync('./results.json', JSON.stringify(resultsArray));
    res.status(200).json('Results saved');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

module.exports = { checkExistingUsers };

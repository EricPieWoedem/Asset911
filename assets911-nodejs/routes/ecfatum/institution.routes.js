const express = require('express');
const {
  createInstitution,
  getAllInstitutions,
  getInstitution,
  getInstitutionAdmins,
  createAdminForInstitution,
  updateInstituion,
} = require('../../controllers/ecfatum/institution.controller');

const ecfatumInstitutionRouter = express.Router();

ecfatumInstitutionRouter.post('/create-institution', createInstitution);
ecfatumInstitutionRouter.get('/get-all-institutions', getAllInstitutions);
ecfatumInstitutionRouter.get('/:id', getInstitution);
ecfatumInstitutionRouter.get('/admins/:id', getInstitutionAdmins);
ecfatumInstitutionRouter.post('/:id/create', createAdminForInstitution);
ecfatumInstitutionRouter.patch('/:id/update', updateInstituion);

module.exports = ecfatumInstitutionRouter;

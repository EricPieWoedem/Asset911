import express from 'express';
import {
  createInstitution,
  getAllInstitutions,
  getInstitution,
  getInstitutionAdmins,
  createAdminForInstitution,
  updateInstituion,
} from '../../controllers/ecfatum/institution.controller';

const ecfatumInstitutionRouter = express.Router();

ecfatumInstitutionRouter.post('/create-institution', createInstitution);
ecfatumInstitutionRouter.get('/get-all-institutions', getAllInstitutions);
ecfatumInstitutionRouter.get('/:id', getInstitution);
ecfatumInstitutionRouter.get('/admins/:id', getInstitutionAdmins);
ecfatumInstitutionRouter.post('/:id/create', createAdminForInstitution);
ecfatumInstitutionRouter.patch('/:id/update', updateInstituion);

export default ecfatumInstitutionRouter;

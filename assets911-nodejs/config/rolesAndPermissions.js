//ecfatum permissions
const ecfatumPermissions = {
  createInstitution: 201,
  createInstitutionAdmin: 202,
  readInstitution: 203,
  updateInstitution: 204,
};

//institution permissions
const instutionPermissions = {
  createAsset: 301,
  readAsset: 302,
  updateAsset: 303,
  deleteAsset: 304,
  assignAsset: 305,
};

// police permissions
const policePermissions = {
  readAsset: 602,
  createOfficer: 601,
  updateOfficer: 603,
};

module.exports = { ecfatumPermissions, instutionPermissions };

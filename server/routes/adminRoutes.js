require("dotenv").config();
const express = require("express");
const {
  loginAdmin,
  logoutAdmin,
  getAllMission,
  addMission,
  editMission,
  deleteMission,
  getAllPolicies,
  addPolicy,
  editPolicy,
  deletePolicy,
  getAllDimension,
  addDimension,
  editDimension,
  deleteDimension,
  getAllIndicator,
  addIndicator,
  editIndicator,
  deleteIndicator,
  getAllLogData,
  getTableNewestVersion,
  addTableData,
} = require("../controllers/adminController");
const {
  loginLimiter,
  validateLogin,
  requireAdmin,
} = require("../middleware/requireAdmin");
const router = express.Router();

// Authentication
router.post("/login", loginLimiter, validateLogin, loginAdmin);
router.post("/logout", logoutAdmin);

// Mission
router.get("/mission", getAllMission);
router.post("/mission", requireAdmin, addMission);
router.put("/mission/:id", requireAdmin, editMission);
router.delete("/mission/:id", requireAdmin, deleteMission);

// Policy
router.get("/policy", getAllPolicies);
router.post("/policy", requireAdmin, addPolicy);
router.put("/policy/:id", requireAdmin, editPolicy);
router.delete("/policy/:id", requireAdmin, deletePolicy);

// Dimension
router.get("/dimension", getAllDimension);
router.post("/dimension", requireAdmin, addDimension);
router.put("/dimension/:id", requireAdmin, editDimension);
router.delete("/dimension/:id", requireAdmin, deleteDimension);

// Indicator
router.get("/indicator", getAllIndicator);
router.post("/indicator", requireAdmin, addIndicator);
router.put("/indicator/:id", requireAdmin, editIndicator);
router.delete("/indicator/:id", requireAdmin, deleteIndicator);

// Log Data
router.get("/log", requireAdmin, getAllLogData);

// Tabel
router.get("/table", requireAdmin, getTableNewestVersion);
router.post("/table", requireAdmin, addTableData);


module.exports = router;

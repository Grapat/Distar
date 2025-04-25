const express = require("express");
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();


router.get("/:id", getUserById);
router.get("/", getAllUsers);

router.put("/:id", updateUser);
router.post("/", createUser);

router.delete("/:id", deleteUser);

module.exports = router;
const express = require("express");
const router = express.Router();
const { receiveEvent } = require("../controllers/event.controller");

router.post("/events", receiveEvent);

module.exports = router;

const express = require('express');
const router = express.Router();

const game =  require("./gameRequest.js");
const userRequest =  require("./userRequest.js");

router.use("/game", game);
router.use("/user", userRequest);


module.exports = router;
const express = require('express');
const router = express.Router();

const game =  require("./gameRequest");
const userRequest =  require("./userRequest");

router.use("/game", game);
router.use("/user", userRequest);


module.exports = router;
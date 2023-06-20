const express = require('express');
const router = express.Router();

const game =  require("./gameRequest.js");
const playerRequest =  require("./playerRequest.js");

router.use("/game", game);
router.use("/player", playerRequest);


module.exports = router;
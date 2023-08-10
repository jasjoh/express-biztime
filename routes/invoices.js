"use strict";
/** Routes for invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

router.get("/", async function(req, res) {
  return res.json({ "hello": "hello" });
});

module.exports = router;
/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

router.get("/", async function(req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies
      ORDER BY name`
  );
  const companies = results.rows;
  return res.json({ companies });
});

router.get("/:code", async function(req, res) {
  let code = req.params.code;
  const result = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );
  const company = result.rows[0];
  return res.json({ company });
});

module.exports = router;
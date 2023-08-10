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
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );
  const company = results.rows[0];
  return res.json({ company });
});

router.post("/", async function(req,res){
  const body = req.body;
  const results = await db.query(
    `INSERT INTO companies (code,name,description)
        VALUES ($1 ,$2, $3)
        RETURNING code, name, description`,
        [body.code, body.name, body.description]
  );
  const company = results.rows[0];
  return res.status(201).json({company})
})




module.exports = router;
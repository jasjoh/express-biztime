"use strict";
/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** Retrieves a list of companies
 * Returns an array of companies
 * Company's response like {code, name}
 */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies
      ORDER BY name`
  );
  const companies = results.rows;
  return res.json({ companies });
});

/**Retrieves the details of specific company
 *Returns the company object like {code, name, description}
 */
router.get("/:code", async function (req, res) {
  let code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );
  const company = results.rows[0];
  if (company === undefined) throw new NotFoundError(`Not found: ${code}`);
  return res.json({ company });
});

/**Creates a new company
 * Expects JSON like {code, name, description}
 * Returns the company object like {code, name, description}
 */
router.post("/", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const body = req.body;
  const results = await db.query(
    `INSERT INTO companies (code,name,description)
        VALUES ($1 ,$2, $3)
        RETURNING code, name, description`,
    [body.code, body.name, body.description]
  );
  const company = results.rows[0];
  return res.status(201).json({ company });
});

/**Updates an existing company's name and description
 * Expects JSON like {name, description}
 * Returns the updated company object like {code, name, description}
 */
router.put("/:code", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const code = req.params.code;
  const body = req.body;
  const results = await db.query(
    `UPDATE companies
        SET name = $1, description = $2
        WHERE code = $3
        RETURNING code, name , description`,
    [body.name, body.description, code]
  );
  const company = results.rows[0];
  if (company === undefined) throw new NotFoundError(`Not found: ${code}`);
  return res.json({ company });
});

/** Deletes a company
 * Returns {status: "deleted"}
*/
router.delete("/:code", async function (req, res) {
  let code = req.params.code;
  const results = await db.query(
    `DELETE
      FROM companies
      WHERE code = $1
      RETURNING code
      `, [code]
  );
  const company = results.rows[0]
  if (company === undefined) throw new NotFoundError(`Not found: ${code}`);
  console.log(results);
  return res.json({ status: "deleted" });
});

module.exports = router;
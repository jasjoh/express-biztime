"use strict";
/** Routes for invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** Retrieves a list of all invoices
 * Returns invoice object like { id, comp_code }
 */
router.get("/", async function(req, res) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices
      ORDER BY id`
  );
  const invoices = results.rows;
  return res.json({ invoices });
});

/**
 * Retrieve a specific invoice
 * Returns an invoice object like { id, amt, paid, add_date, ...
 * ... paid_date, company: {code, name, description } }
 */
router.get("/:id", async function(req, res) {
  const id = req.params.id;
  const iResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date
      FROM invoices
      WHERE id = $1`, [id]
  );
  const invoice = iResult.rows[0];
  if (invoice === undefined) throw new NotFoundError(`Not found: ${id}`);
  const cResult = await db.query(
    `SELECT code, name, description
      FROM companies AS c
      JOIN invoices AS i ON i.comp_code = c.code
      WHERE id = $1`, [id]
  );
  const company = cResult.rows[0];
  invoice.company = company;
  return res.json({ invoice });
});

/**
 * Creates a new invoice
 * Expects JSON body like { comp_code, amt }
 * Return invoice object like { id, comp_code, amt, paid, add_date, paid_date }
 */
router.post("/", async function(req, res) {
  if (req.body === undefined) { throw new BadRequestError(); }
  // TODO: How do we handle things like comp_code doesn't exist?
  const body = req.body;
  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [body.comp_code, body.amt]
  );
  const invoice = result.rows[0];
  return res.json({ invoice });
})

module.exports = router;
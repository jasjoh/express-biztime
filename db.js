/** Database setup for Biztime. */

const { Client } = require("pg");

/*
const DB_URI = process.env.NODE_ENV === "test"  // 1
    ? "postgresql:///biztime_test"
    : "postgresql:///biztime";
*/

const DB_URI = process.env.NODE_ENV === "test"  // 1
    ? "postgresql://earliercuyler:rithm@localhost/biztime_test"
    : "postgresql://earliercuyler:rithm@localhost/biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();                                   // 2

module.exports = db;                            // 3

/**
 * COMPANIES
 * - code : text : not-nullable : primary key
 * - name : text : not-nullable
 * -- constraint: must be unique
 * - description : text : not nullable
 *
 * INVOICES
 * - id : integer : not-nullable: primary key : auto generated
 * - comp_code: text : not-nullable : foreign key -> companies.code
 * - amt : number (10 digits, 2 decimals) : not-nullable
 * -- constraint: amt >= 0 and numeric
 * - paid : boolean : non-nullable: default is 'false'
 * - add_date : date : not-nullable : default is CURRENT_DATE
 * - paid_date : date : NULLABLE
 */
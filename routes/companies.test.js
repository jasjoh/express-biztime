// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");

  // create test company
  let cResult = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('testcomp1', 'test company 1', 'test description 1')
    RETURNING code, name, description`);
  testCompany = cResult.rows[0];
});


/** GET /companies - returns `{companies: [company, ...]}` */
describe("GET /companies", function() {
  test("Gets a list companies", async function() {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
        companies: [{
            code: "testcomp1",
            name: "test company 1"
          }]
      })
  });
})
// end


/** GET /companies/[code] -
 * returns data about one company: `{company: company}` */
describe("GET /companies/[code]", function() {
  test("Gets a specific company", async function() {
    const response = await request(app).get("/companies/testcomp1");
    expect(response.body).toEqual({
      company: {
        code: "testcomp1",
        name: "test company 1",
        description: "test description 1",
        invoices: []
      }
    })
  })

  test("Gets a non-existant company", async function() {
    const response = await request(app).get("/companies/notacode");
    expect(response.body).toEqual({
      error: {
        message: "Not found: notacode",
        status: 404
      }
    })
    expect(response.statusCode).toEqual(404);
  })
})
// end

afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});

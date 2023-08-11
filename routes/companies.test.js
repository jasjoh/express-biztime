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
describe("GET /companies", function () {
  test("Gets a list companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      companies: [{
        code: "testcomp1",
        name: "test company 1"
      }]
    });
  });
});
// end


/** GET /companies/[code] -
 * returns data about one company: `{company: company}` */
describe("GET /companies/[code]", function () {
  test("Gets a specific company", async function () {
    const response = await request(app).get("/companies/testcomp1");
    expect(response.body).toEqual({
      company: {
        code: "testcomp1",
        name: "test company 1",
        description: "test description 1",
        invoices: []
      }
    });
  });

  test("Gets a non-existant company", async function () {
    const response = await request(app).get("/companies/notacode");
    expect(response.body).toEqual({
      error: {
        message: "Not found: notacode",
        status: 404
      }
    });
    expect(response.statusCode).toEqual(404);
  });
});
// end

afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});

describe("POST /companies", function () {
  test("Creates a new company", async function () {
    const response = await request(app)
      .post("/companies")
      .send({
        code: "testcomp2",
        name: "testcompany2",
        description: "testdescription2"
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual(
      {
        company: {
          code: "testcomp2",
          name: "testcompany2",
          description: "testdescription2",
        }
      });

  });

  test("create company without passing body", async function () {
    const response = await request(app).post("/companies");
    expect(response.statusCode).toEqual(400);
  });
});

describe("PUT /companies/[code]", function () {
  test("Update a company", async function () {
    const response = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "changed name", description: "changed description" });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      {
        company: {
          code: testCompany.code,
          name: "changed name",
          description: "changed description",
        }
      });
  });
  test("update company without passing body", async function () {
    const response = await request(app).put(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(400);
  });
});

describe("DELETE /companies/[code]", function () {
  test("Deleting a company", async function () {
    const response = await request(app)
      .delete(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      status: "deleted"
    });

    const results = await db.query(
      `SELECT code
        FROM companies
        WHERE code = '${testCompany.code}'
      `
    )
    const company = results.rows[0];
    expect(company).toEqual(undefined)


  });
});
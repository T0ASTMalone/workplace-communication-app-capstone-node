const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("Wp endpoint", () => {
  let db;
  let testWp = helpers.makeWp();
  let testUsers = helpers.makeUsers();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /api/wp", () => {
    context("Given there are wp in the db", () => {
      beforeEach("seed wp", () => {
        helpers.seedWp(db, testWp);
        helpers.seedUsers(db, testUsers);
      });

      const testUser = testUsers[0];

      const expectedWp = testWp.map(wp =>
        Object.keys(wp)
          .filter(key => key !== "wp_code")
          .reduce((res, key) => ((res[key] = wp[key]), res), {})
      );

      it("responds with 200 and wp info", () => {
        return supertest(app)
          .get("/api/wp")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedWp);
      });
    });

    context("Given there are no wp in the db", () => {
      it("responds with 404 wp not found", () => {
        return supertest(app)
          .get("/api/wp")
          .expect(404, { error: { message: `There are not workplaces here` } });
      });
    });
  });

  describe("POST /api/wp", () => {
    context(`Wp validation`, () => {
      const requiredFields = ["name", "type"];
      const wp = testWp[0];

      requiredFields.forEach(field => {
        const createWpAttempt = {
          name: "TEST COMPANY",
          type: "company"
        };
        it(`responds with 400 error when required ${field} is missing`, () => {
          delete createWpAttempt[field];
          return supertest(app)
            .post("/api/wp")
            .send(createWpAttempt)
            .expect(400)
            .expect(wp => {
              if (field === "name") {
                expect({ error: { message: `Missing name in request body` } });
              }
              expect({
                error: { message: `Missing ${field} in request body` }
              });
            });
        });
      });
    });

    context("Happy Path", () => {
      it("responds with 201, serialized wp", () => {
        const newWp = {
          name: "TEST WP",
          type: "company"
        };

        return supertest(app)
          .post("/api/wp")
          .send(newWp)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("wp_id");
            expect(res.body.wp_name).to.eql(newWp.name);
            expect(res.body.type).to.eql(newWp.type);
            expect(res.headers.location).to.eql(`/api/wp/${res.body.wp_id}`);
          })
          .expect(res =>
            db
              .from("workplaces")
              .select("*")
              .where("wp_id", res.body.wp_id)
              .first()
              .then(row => {
                expect(row).to.have.property("wp_code");
              })
          );
      });
    });
  });
});

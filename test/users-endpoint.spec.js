const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe("users router", () => {
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

  describe("GET /api/users/:id", () => {
    context("Given there are users in the db", () => {
      beforeEach("seed users and wp", () => {
        helpers.seedWp(db, testWp);
        helpers.seedUsers(db, testUsers);
      });
      const testUser = testUsers[0];
      const expectedUser = Object.keys(testUser)
        .filter(key => key !== "password")
        .reduce((res, key) => ((res[key] = testUser[key]), res), {});
      it("responds with 200 and the users info", () => {
        return supertest(app)
          .get(`/api/users/${testUser.user_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedUser);
      });
    });

    context("Given there are no users in the db", () => {
      it("responds with 404", () => {
        return supertest(app)
          .get(`/api/users/1`)
          .set("Authorization", "Bearer thisisapassword")
          .expect(401, { error: "Unauthorized request" });
      });
    });
  });

  describe(`Post /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach("insert wp", () => {
        helpers.seedWp(db, testWp);
      });

      const requiredFields = [
        "username",
        "password",
        "code",
        "type",
        "nickname",
        "img"
      ];
      const testUser = testUsers[0];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: "testuser",
          password: "Thisis@testpassword!",
          code: 1234,
          type: "user",
          nickname: null,
          img: null
        };
        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });
  });
});

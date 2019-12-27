const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe.only("Posts router", () => {
  let db;
  let testWp = helpers.makeWp();
  let testUsers = helpers.makeUsers();
  let testPosts = helpers.makePosts();
  let { acksToPost, expectedAcks } = helpers.makeAcks();

  let testUser = testUsers[0];

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

  beforeEach("Seed wp and users", async () => {
    await helpers.seedWp(db, testWp);
    await helpers.seedUsers(db, testUsers);
    await helpers.seedPosts(db, testPosts);
  });

  describe("GET api/seen/", () => {
    const testUser = testUsers[0];
    context("Given no posts have been seed", () => {
      it("responds with 200 and an empty array", () => {
        return supertest(app)
          .get("/api/seen")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context("Given posts have been seen", () => {
      beforeEach("seed acks", () => {
        helpers.seedAcks(db, acksToPost);
      });

      it("responds with 200 and the expected acks", () => {
        return supertest(app)
          .get("/api/seen")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedAcks);
      });
    });
  });
});

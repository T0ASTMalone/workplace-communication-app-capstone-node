const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe.only("Posts router", () => {
  let db;
  let testWp = helpers.makeWp();
  let testUsers = helpers.makeUsers();
  let testPosts = helpers.makePosts();

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

  describe("GET /api/posts/:id", () => {
    context("Given there are posts in the db", () => {
      beforeEach("seed users and wp and posts", () => {
        helpers.seedWp(db, testWp);
        helpers.seedUsers(db, testUsers);
        helpers.seedPosts(db, testPosts);
      });
      const testUser = testUsers[0];
      const expectedPost = testPosts[0];
      it("responds with 200 and the post", () => {
        return supertest(app)
          .get(`/api/posts/${testUser.user_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedPost);
      });
    });

    context("Given there are no posts in the db", () => {
      it("responds with 404", () => {
        return supertest(app)
          .get(`/api/posts/1`)
          .set("Authorization", "Bearer thisisapassword")
          .expect(401, { error: "Unauthorized request" });
      });
    });
  });
});

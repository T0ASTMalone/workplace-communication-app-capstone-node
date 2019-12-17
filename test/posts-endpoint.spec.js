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

  beforeEach("Seed wp and users", async () => {
    await helpers.seedWp(db, testWp);
    helpers.seedUsers(db, testUsers);
  });

  describe("GET /api/posts/:id", () => {
    context.only("Given there are posts in the db", () => {
      beforeEach("seed users and wp and posts", () => {
        helpers.seedPosts(db, testPosts);
      });
      const testUser = testUsers[0];

      it("responds with 200 and the post", () => {
        const expectedPost = testPosts[0];
        return supertest(app)
          .get(`/api/posts/${expectedPost.post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedPost);
      });

      it("Responds with 201", () => {
        return supertest(app)
          .delete(`/api/posts/${testPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(204);
      });

      it("responds with 204 and the post is updated", () => {
        const newPost = {
          ...testPosts[0],
          content: "This is an updated post"
        };

        return supertest(app)
          .patch(`/api/posts/${testPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(newPost)
          .expect(204);
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

  describe("GET /api/posts", () => {
    context("given there are no posts", () => {
      const testUser = testUsers[0];
      it("responds with 404", () => {
        return supertest(app)
          .get("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context("given there are posts in the db", () => {
      beforeEach("Seed wp and users", () => {
        helpers.seedPosts(db, testPosts);
      });

      const testUser = testUsers[0];

      it("responds with 4", () => {
        return supertest(app)
          .get("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testsUser))
          .expect(200, testPosts);
      });
    });
  });
});

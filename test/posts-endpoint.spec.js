const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe("Posts router", () => {
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
    context("Given there are posts in the db", () => {
      beforeEach("seed users and wp and posts", () => {
        helpers.seedPosts(db, testPosts);
      });
      const testUser = testUsers[0];

      it("responds with 200 and the post", () => {
        const expectedPost = helpers.makeExpectedPosts();

        return supertest(app)
          .get(`/api/posts/${expectedPost[1].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedPost[1]);
      });

      // these 2 need to move to their own describe blocks
      // both pass on their own but not when other test are ran at the
      // same time
      it("Responds with 201 and deletes post", () => {
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
    // passes on its own but not when ran alongside other test
    context("given there are posts in the db", () => {
      beforeEach("Seed wp and users", () => {
        helpers.seedPosts(db, testPosts);
      });

      const testUser = testUsers[0];

      it("responds with all posts", () => {
        return supertest(app)
          .get("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, testPosts);
      });
    });
  });

  describe("GET /api/posts/wp/:wpId", () => {
    context("Get all posts for a wp", () => {
      beforeEach("Seed wp and users", () => {
        helpers.seedPosts(db, testPosts);
      });

      let expectedPosts = helpers.makeExpectedPosts();

      const testUser = testUsers[0];

      it("responds with wp posts", () => {
        return supertest(app)
          .get(`/api/posts/wp/${1}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedPosts);
      });
    });

    context("Get all posts for a wp with type post", () => {
      beforeEach("Seed wp and users", () => {
        helpers.seedPosts(db, testPosts);
      });

      let expectedPosts = helpers.makeExpectedPosts();

      const testUser = testUsers[0];

      let types = ["posts", "idea"];

      types.forEach((type, i) => {
        it("responds with wp posts", () => {
          return supertest(app)
            .get(`/api/posts/wp/${1}?type=${type}`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .expect(200, [expectedPosts[i]]);
        });
      });
    });
  });
});

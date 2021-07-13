const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");

describe("Posts router", () => {
  let db;
  let testWp = helpers.makeWp();
  let testUsers = helpers.makeUsers();
  let { testPosts, expectedPosts } = helpers.makePosts();
  let { acksToPost } = helpers.makeAcks();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
      pool: { min: 0, max: 100 },
      connectTimeout: 90000,
      debug: true,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", async () => {
    await helpers.cleanTables(db);
  });

  afterEach("cleanup", () => helpers.cleanTables(db));

  beforeEach("Seed wp and users", async () => {
    await helpers.seedWp(db, testWp);
    await helpers.seedUsers(db, testUsers);
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
      beforeEach("Seed posts", async () => {
        await helpers.seedPosts(db, testPosts);
        await helpers.seedAcks(db, acksToPost);
      });

      const testUser = testUsers[0];

      it("responds with all posts", () => {
        return supertest(app)
          .get("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, expectedPosts);
      });
    });
  });

  describe("POST /api/posts", () => {
    const testUser = testUsers[0];
    context("Given there is missing field", () => {
      const requiredFields = ["user_id", "title", "type", "wp_id", "content"];

      requiredFields.forEach((field) => {
        const testPost = {
          user_id: 1,
          title: "This is a test title",
          type: "posts",
          wp_id: 1,
          content: "this is a test post",
        };
        delete testPost[field];
        it("responds with 400 Missing field in request body", () => {
          return supertest(app)
            .post("/api/posts")
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(testPost)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });
    });

    context("Happy path", () => {
      const testPost = {
        user_id: 1,
        title: "This is a test title",
        type: "posts",
        priority: 0,
        wp_id: 1,
        content: "this is a test post",
      };

      it("responds with 201 and the new post", () => {
        return supertest(app)
          .post("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(testPost)
          .expect(201);
      });
    });
  });

  describe("GET /api/posts/:id", () => {
    const testUser = testUsers[0];
    context("Given there are posts in the db", () => {
      beforeEach("seed users and wp and posts", async () => {
        await helpers.seedPosts(db, testPosts);
        await helpers.seedAcks(db, acksToPost);
      });

      it("responds with 200 and the post", () => {
        const { expectedPosts } = helpers.makePosts();

        return supertest(app)
          .get(`/api/posts/${expectedPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(expectedPosts[0]);
      });
    });

    context("Given there are no posts in the db", () => {
      it("responds with 404 post not found", () => {
        return supertest(app)
          .get(`/api/posts/1`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: "Post not found" } });
      });
    });
  });

  describe("DELETE /api/posts/:id", () => {
    const testUser = testUsers[0];
    context("Given the posts exists", () => {
      beforeEach("seed posts", async () => {
        await helpers.seedPosts(db, testPosts);
      });
      it("Responds with 201 and deletes post", () => {
        return supertest(app)
          .delete(`/api/posts/${testPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(204);
      });
    });

    context("Given the posts does not exists", () => {
      it("Responds with 404 post not found", () => {
        return supertest(app)
          .delete(`/api/posts/${testPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: "Post not found" } });
      });
    });
  });

  describe("PATCH /api/posts/:id", () => {
    beforeEach("seed posts", async () => {
      await helpers.seedPosts(db, testPosts);
    });

    const testUser = testUsers[0];
    context("Given the post exists", () => {
      it("responds with 204 and the post is updated", () => {
        const newPost = {
          ...testPosts[0],
          content: "This is an updated post",
        };

        return supertest(app)
          .patch(`/api/posts/${testPosts[0].post_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(newPost)
          .expect(204);
      });
    });
  });

  describe("GET /api/posts/:wpId/wp", () => {
    beforeEach("Seed wp and users", async () => {
      await helpers.seedPosts(db, testPosts);
      await helpers.seedAcks(db, acksToPost);
    });

    context("Get all posts for a wp", () => {
      const testUser = testUsers[0];

      const { expectedPosts } = helpers.makePosts();
      it("responds with wp posts", () => {
        const wpPosts = expectedPosts.filter((post) => {
          return post.wp_id === 1;
        });
        return supertest(app)
          .get(`/api/posts/${1}/wp`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200, wpPosts);
      });
    });

    context("Get all posts for a wp with type post", () => {
      let { expectedPosts } = helpers.makePosts();

      const testUser = testUsers[0];

      let types = ["idea", "posts"];

      types.forEach((type, i) => {
        it("responds with wp posts", () => {
          return supertest(app)
            .get(`/api/posts/${1}?type=${type}/wp`)
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .expect(200, [expectedPosts[i]]);
        });
      });
    });
  });
});

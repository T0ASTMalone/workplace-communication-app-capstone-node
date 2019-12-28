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

  describe("POST api/seen", () => {
    const testUser = testUsers[0];
    context("Given there is missing data in post request", () => {
      const fields = ["user_id", "post_id"];

      fields.forEach(field => {
        const ack = {
          user_id: 1,
          post_id: 3
        };

        it(`responds with 'Missing acknowledgement in request body'`, () => {
          delete ack[field];
          return supertest(app)
            .post("/api/seen")
            .set("Authorization", helpers.makeAuthHeader(testUser))
            .send(ack)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });

    context("Given the post does not or no longer exists", () => {
      const ack = {
        user_id: 1,
        post_id: 200
      };

      it(`responds with 400 'post does not or no longer exists'`, () => {
        return supertest(app)
          .post("/api/seen")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(ack)
          .expect(400, {
            error: `Post does not or no longer exists`
          });
      });
    });

    context("Happy path", () => {
      const testUser = testUsers[0];
      const ack = {
        user_id: testUser.user_id,
        post_id: 4
      };
      it("responds with 201 and the new acknowledgement", () => {
        return supertest(app)
          .post("/api/seen")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .send(ack)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.user_id).to.eql(testUser.user_id);
            expect(res.body.post_id).to.eql(ack.post_id);
            expect(res.headers.location).to.eql(`/api/seen/${res.body.id}`);
          });
      });
    });
  });

  describe.only("DELETE /api/seen/:id", () => {
    const testUser = testUsers[0];
    context("Given ack does not exits", () => {
      it(`responds with 400 'Acknowledgement not found'`, () => {
        return supertest(app)
          .delete("/api/seen/200")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: "Acknowledgement not found" } });
      });
    });

    context("Given there are acks in db", () => {
      beforeEach("Seed acks", async () => {
        await helpers.seedAcks(db, acksToPost);
      });

      const deletedAck = expectedAcks.filter(ack => ack.id !== 1);

      it("responds with 204", () => {
        return supertest(app)
          .delete("/api/seen/1")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(204)
          .expect(res =>
            db
              .from("seen")
              .innerJoin("users", "seen.user_id", "users.user_id")
              .select("seen.*", "users.nickname")
              .then(acks => {
                expect(acks).to.eql(deletedAck);
              })
          );
      });
    });
  });
});

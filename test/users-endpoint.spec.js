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
      // beforeEach("insert wp", () => {
      //   helpers.seedWp(db, testWp);
      // });

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
          type: "pending",
          code: 1234,
          nickname: null,
          img: null
        };
        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];
          if (field !== "nickname" && field !== "img") {
            return supertest(app)
              .post("/api/users")
              .send(registerAttemptBody)
              .expect(400, {
                error: `Missing '${field}' in request body`
              });
          }
        });
      });

      it("responds 400 password must be longers than 8 characters when empty password", () => {
        const shortPass = {
          username: "Test user",
          password: "112",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };

        return supertest(app)
          .post("/api/users")
          .send(shortPass)
          .expect(400, {
            error: { message: `Password be longer than 8 characters` }
          });
      });

      it(`responds 400 'Password be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          username: "testusername",
          password: "*".repeat(73),
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };
        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, {
            error: { message: `Password be less than 72 characters` }
          });
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          username: "Test user",
          password: " 1Aa!2Bb@",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: {
              message: `Password must not start or end with empty spaces`
            }
          });
      });

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          username: "testemail@testmail",
          password: "1Aa!2Bb@ ",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordEndsSpaces)
          .expect(400, {
            error: {
              message: `Password must not start or end with empty spaces`
            }
          });
      });

      it(`responds 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          username: "testemail@testmail",
          password: "11AAaabb",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordNotComplex)
          .expect(400, {
            error: {
              message: `Password must contain 1 upper case, lower case, number and special character`
            }
          });
      });

      it(`responds 400 'Username already taken' when username isn't unique`, async () => {
        await helpers.seedWp(db, testWp);
        await helpers.seedUsers(db, testUsers);
        const duplicateUser = {
          username: testUser.username,
          password: "TestPassw0rd!",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };
        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, { error: { message: `Username already taken` } });
      });
    });

    context(`Happy path`, () => {
      it(`responds 201, serialized user, storing bcryped password`, async () => {
        await helpers.seedWp(db, testWp);
        const newUser = {
          username: "testusername",
          password: "TestPassw0rd!",
          type: "",
          code: 1234,
          nickname: null,
          img: null
        };

        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("user_id");
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.nickname).to.be.oneOf([newUser.nickname, ""]);
            expect(res.body.img).to.eql(newUser.img);
            expect(res.body.type).to.be.oneOf(["pending", "creator", "user"]);
            expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(
              `/api/users/${res.body.user_id}`
            );
          })
          .expect(res =>
            db
              .from("users")
              .select("*")
              .where("user_id", res.body.user_id)
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});

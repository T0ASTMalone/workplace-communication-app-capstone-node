require("dotenv").config();
const { expect } = require("chai");
const supertest = require("supertest");

process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres@localhost/workplace-test";
process.env.TZ = "UCT";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";

global.expect = expect;
global.supertest = supertest;

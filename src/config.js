require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/workplace",
  TEST_DATABASE_URL:
    process.env.TEST_DB_URL || "postgresql://postgres@localhost/workplace-test",
  JWT_SECRET: process.env.JWT_SECRET || "cantsleepclownswilleatme",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "10m"
};

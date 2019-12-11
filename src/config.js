module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://dunder_mifflin:itstoasty@localhost/macros-tracker',
  TEST_DATABASE_URL:
    process.env.TEST_DB_URL ||
    'postgresql://dunder_mifflin:itstoasty@localhost/macros-tracker-test',
  JWT_SECRET: process.env.JWT_SECRET || 'mumbai-power',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '10m'
};

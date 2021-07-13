const app = require("./app");
const { PORT, DATABASE_URL, TEST_DATABASE_URL, NODE_ENV } = require("./config");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: NODE_ENV === "production" ? DATABASE_URL : TEST_DATABASE_URL,
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

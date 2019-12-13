const path = require("path");
const express = require("express");
const usersService = require("./users-service");
const usersRouter = express.Router();

const jsonParser = express.json();

usersRouter.route("/").get((req, res, next) => {
  const knex = req.app.get("db");
  usersService
    .getUsers(knex)
    .then(users => {
      res.json(users.map(user => usersService.serializeUser(user)));
    })
    .catch(next);
});

module.exports = usersRouter;

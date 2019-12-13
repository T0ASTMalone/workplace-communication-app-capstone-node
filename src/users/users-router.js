const path = require("path");
const express = require("express");
const usersService = require("./users-service");
const usersRouter = express.Router();

const jsonParser = express.json();

usersRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    usersService
      .getUsers(knex)
      .then(users => {
        res.json(users.map(user => usersService.serializeUser(user)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const {
      user_id,
      username,
      password,
      wp_id,
      wp_name,
      type,
      nickname,
      img
    } = req.body;
    const user = {
      user_id,
      username,
      password,
      wp_id,
      wp_name,
      type,
      nickname,
      img
    };

    if (!user) {
      return res
        .status(400)
        .json({ error: { message: `Missing user in request body` } });
    }

    for (const [key, value] of Object.entries(userInfo)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    const passErr = usersService.validatePassword(password);
    if (passErr) {
      return res.status(400).json({ error: { message: passErr } });
    }

    usersService
      .usrExists(knex, username, wp_id)
      .then(existing => {
        if (existing) {
          return res
            .status(400)
            .json({ error: { message: "User already exists" } });
        }
        return usersService.hashPass(password).then(hashedPass => {
          user.password = hashedPass;
          return usersService.createUser(knex, user).then(user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl + `/${user.user_id}`))
              .json(usersServices.serializeUser(user));
          });
        });
      })
      .catch(next);
  });

module.exports = usersRouter;

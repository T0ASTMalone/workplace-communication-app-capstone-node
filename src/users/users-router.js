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
      .getAllUsers(knex)
      .then(users => {
        res.json(users.map(user => usersService.serializeUser(user)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const { username, password, code, type, nickname, img } = req.body;

    usersService
      .getWp(knex, code)
      .then(wp => {
        if (!wp) {
          return res
            .status(404)
            .json({ error: { message: `Invalid WorkPlace Code` } });
        }

        let wp_id = wp.wp_id;
        let wp_name = wp.wp_name;
        const user = {
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

        for (const [key, value] of Object.entries(user)) {
          if (value == null) {
            if (key !== "nickname" && key !== "img") {
              return res.status(400).json({
                error: `Missing '${key}' in request body`
              });
            }
          }
        }

        const passErr = usersService.validatePassword(password);
        if (passErr) {
          return res.status(400).json({ error: { message: passErr } });
        }

        usersService.usrExists(knex, username, wp_id).then(existing => {
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
                .json(usersService.serializeUser(user));
            });
          });
        });
      })
      .catch(next);
  });

usersRouter
  .route("/:id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    usersService
      .getUsrById(knex, id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: { message: `User not found` } });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((res, req, next) => {
    return res.status(200).json(usersService.serializeUser(res.user));
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    usersService
      .deleteUsr(knex, id)
      .then(() => {
        return res.status(201).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    const newUserInfo = req.body;
    if (!newUserInfo) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a 'user name'`
        }
      });
    }
    usersServices
      .updateUser(knex, id, newUserInfo)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

usersRouter.route("/wp/:wpId").all((req, res, next) => {
  const knex = req.app.get("db");
  const id = req.params.wpId;
  usersService
    .getWpUsers(knex, id)
    .then(users => {
      if (!users) {
        return res
          .status(404)
          .json({ error: { message: `There are no users in this WorkPlace` } });
      }
      return res
        .status(200)
        .json(users.map(user => usersService.serializeUser(user)));
    })
    .catch(next);
});

module.exports = usersRouter;

const path = require("path");
const express = require("express");
const shortid = require("shortid");

const wpService = require("./workplaces-service");
const requireAuth = require("../auth/auth-router");
const wpRouter = express.Router();

const jsonParser = express.json();

wpRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    wpService
      .getWorkplaces(knex)
      .then((workplaces) => {
        if (workplaces.length < 1) {
          return res
            .status(404)
            .json({ error: { message: `There are not workplaces here` } });
        }
        return res
          .status(200)
          .json(workplaces.map((wp) => wpService.serializeWp(wp)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knex = req.app.get("db");
    const { name, type } = req.body;
    const wp = { wp_name: name, type };
    for (const [key, value] of Object.entries(wp)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });
      }
    }
    wp.wp_code = shortid.generate();
    wpService
      .createWp(knex, wp)
      .then((newWp) => {
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${newWp.wp_id}`))
          .json(wpService.serializeWp(newWp, true));
      })
      .catch(next);
  });

wpRouter
  .route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    let knex = req.app.get("db");
    let id = req.params.id;
    wpService
      .getById(knex, id)
      .then((wp) => {
        if (!wp) {
          return res
            .status(404)
            .json({ error: { message: `WorkPlace not found` } });
        }
        res.wp = wp;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(wpService.serializeWp(res.wp));
  });

wpRouter
  .route("/err/:id")
  .all((req, res, next) => {
    let knex = req.app.get("db");
    let id = req.params.id;
    wpService
      .getWpUsers(knex, id)
      .then((wp) => {
        if (wp > 1) {
          return res
            .status(400)
            .json({ error: { message: `Can't delete workplace` } });
        }
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    const id = req.params.id;
    wpService
      .deleteWp(knex, id)
      .then(() => {
        return res.status(201).json();
      })
      .catch(next);
  });

module.exports = wpRouter;

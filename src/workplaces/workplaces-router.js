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
      .then(workplaces => {
        if (!workplaces) {
          return res
            .status(404)
            .json({ error: { message: `There are not workplaces here` } });
        }
        return res
          .status(200)
          .json(workplaces.map(wp => wpService.serializeWp(wp)));
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
          error: `Missing '${key}' in request body`
        });
      }
    }
    wp.wp_code = shortid.generate();
    wpService
      .createWp(knex, wp)
      .then(newWp => {
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl + `${newWp.wp_id}`))
          .json(wpService.serializeWp(newWp));
      })
      .catch(next);
  });

module.exports = wpRouter;

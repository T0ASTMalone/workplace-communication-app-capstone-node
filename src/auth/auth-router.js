const express = require("express");
const AuthService = require("./auth-services");
const { requireAuth } = require("../middleware/jwt-auth");
const authRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require("xss");

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { nickname, password, type } = req.body;
  const loginUser = { nickname, password, type };
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });
  AuthService.getUserWithNickname(
    req.app.get("db"),
    loginUser.nickname,
    loginUser.type
  )
    .then(dbUser => {
      if (!dbUser) {
        return res.status(400).json({
          error: `Incorrect nickname, password, or type`
        });
      }
      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then(compareMatch => {
        if (!compareMatch) {
          return res.status(400).json({
            error: `Incorrect email or password`
          });
        }
        const sub = dbUser.nickname;
        const payload = { user_id: dbUser.user_id };
        const { wp_name } = dbUser;
        res.send({
          authToken: AuthService.createJwt(sub, payload),
          wp_name: xss(wp_name),
          payload
        });
      });
    })
    .catch(next);
});

authRouter.post("/refresh", requireAuth, (req, res, next) => {
  const sub = req.user.nickname;
  const payload = { user_id: req.user.user_id };
  res.send({
    authToken: AuthService.createJwt(sub, payload),
    payload
  });
});

module.exports = authRouter;

import { classes } from "../classInitializer.js";

export const updateUserMiddleware =
  (lean = true) =>
  async (req, res, next) => {
    const users = classes.Users;

    try {
      const token = req.cookies.authorization;

      if (!token)
        return res
          .status(401)
          .json({ message: "No authorization token found" });

      const userId = await users.verifyToken(token).catch((err) => {
        return next(err);
      });

      const user = await users.getById(userId, lean);

      if (!user) return next("Token invalid");

      const newToken = await users.generateToken(user);

      res.cookie("authorization", newToken, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
      });

      res.locals.user = user;
    } catch (err) {
      return next(err);
    }
    return next();
  };

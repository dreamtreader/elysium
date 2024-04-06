export const authorizationMiddleware = (req, res, next) => {
  if (!res.locals.user) return next({ message: "User not logged in." });
  return next();
};

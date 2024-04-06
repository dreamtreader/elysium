export const contextualMiddleware =
  (condition, middleware, middlewareArgs) => (req, res, next) => {
    if (condition(res.locals)) {
      if (middlewareArgs) return middleware(...middlewareArgs)(req, res, next);
      else return middleware(req, res, next);
    }
    return next();
  };

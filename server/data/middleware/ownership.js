export const ownershipMiddleware = (entity) => (req, res, next) => {
  const user = res.locals.user;
  const entity = res.locals[entity];

  if (user._id !== entity.ownerId)
    return next({ message: `You are not the owner of this ${entity}` });
  return next();
};

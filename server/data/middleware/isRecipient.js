export const isRecipientMiddleware = (req, res, next) => {
  const channel = res.locals.channel;
  const user = res.locals.user;
  if (channel.recipients.includes(user._id).toString()) return next();
  else return next({ message: "You are not part of this group DM." });
};

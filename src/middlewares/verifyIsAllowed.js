const verifyIsAllowed = (req, res, next) => {
  if ((customer_id != req.userToken.customer_id) || (!req.userToken.is_admin) ) {
    console.log({token: req.userToken})
      return res.status(403).json({ success:false, message: "You must be an admin" });
  }
  next();
}

module.exports = verifyIsAllowed;
const verifyIsAllowed = (req, res, next) => {
  if ((!req.userToken.is_admin) || (customer_id != req.userToken.customer_id)) {
    console.log({token: req.userToken})
      return res.status(403).json({ success:false, message: "You must be an admin" });
  }
  next();
}

module.exports = verifyIsAllowed;
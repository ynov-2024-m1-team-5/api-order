const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {

  let token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).send({
      success: false,
      token: null,
      message:"Missing token"
    })
  }
 
  jwt.verify(token, process.env.JWT_SECRET,{
    algorithms: [process.env.JWT_ALGORITHM]
  }, function (error, jwtDecoded) {
    if (error) {
      return res.status(401).send({
        success: false,
        token: null,
        message: error.message
      })
    }
    req.userToken = jwtDecoded;
    next();
  })
}

module.exports = verifyToken;
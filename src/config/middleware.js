import jwt from 'jsonwebtoken';
import env from '../config/env/development';

function verifyToken(req, res, next){
  let tokenHeader = req.headers['authorization'];
	
	// try to decode token
  if (tokenHeader && tokenHeader.split(" ").length > 0) {
		let token = tokenHeader.split(" ")[1];
    // verifies secret and checks expiration
    jwt.verify(token, env.jwt.secret, (err, decoded) => {      
      if (err) {
				// Token may have expire or an unexpected error occured 
        return res.status(401).json({ message: 'Failed to authenticate token.' });    
      } else {
        // Save token into the request
        req.profileId = decoded.profileId;
        next();
      }
    });

  } else {
    return res.status(401).send({
        message: 'No token provided or invalid format.' 
    });
  }
}

export default {
  verifyToken
}
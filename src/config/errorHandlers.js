import ev from 'express-validation'
import logger from './log';

export default function errorHandlers(app) {
  // handle Validation errors
  app.use(function(err, req, res, next) {
    if (err instanceof ev.ValidationError) {
      res.status(err.status).send(err);
    } else {
      return next(err);
    }
  });

  // handling all errors except 500 and unknown errors
  app.use(function(err, req, res, next) {
    if (!err.status || err.status == 500) {
      return next(err);      
    } else {
      res.status(err.status).send({
        status: err.status,
        message: err.message
      });
    }
  });

  // fall back error
  app.use(function(err, req, res, next) {
    res.status(500).send({
      status: 500,
      message: 'internal error'
    });
  });
}
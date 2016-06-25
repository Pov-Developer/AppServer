import bunyan from 'bunyan';

const app = bunyan.createLogger({
  name: 'app',
  serializers: {
    req: reqSerializer
  },
  streams: [{
    level: 'info',
    stream: process.stdout
  }, {
    level: 'info',
    path: './log/app.log'
  }]
});

const user = bunyan.createLogger({
  name: 'user',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'debug',
    path: './log/app.log'
  }],
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

const survey = bunyan.createLogger({
  name: 'survey',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'debug',
    path: './log/app.log'
  }],
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

const question = bunyan.createLogger({
  name: 'question',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'debug',
    path: './log/app.log'
  }],
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

function reqSerializer(req) {
  return {
    method: req.method,
    url: req.url,
    authHeader: req.headers['authorization'],
    body: req.body,
    ip: req.headers['x-forwarded-for'] || req.ip
  };
}

export default {
  app,
  user,
  survey,
  question
}
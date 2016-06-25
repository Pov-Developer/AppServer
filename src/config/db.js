import mssql from 'mssql';
import env from './env/development';

const connection = new mssql.Connection(env.db);

export default {
  connect: () => { return connection.connect()},
  connection: () => { return connection}
}
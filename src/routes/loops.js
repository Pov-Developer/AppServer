import {
	Router
} from 'express';
import sql from 'mssql';

import db from '../config/db';

const connection = db.connection();

var router = Router();

router.get('/', function(req,res,next) {
	let request = new sql.Request(connection);
	request.query('select * from dbo.loop').then((recordset) => {
		res.send(recordset);
	}).catch((err) => {
		return next(err)
	});
});


export default router;
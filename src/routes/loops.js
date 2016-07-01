import {
	Router
} from 'express';
import sql from 'mssql';

import db from '../config/db';
import middleware from '../config/middleware';

const connection = db.connection();

var router = Router();

router.get('/', middleware.verifyToken, function (req, res, next) {
	let request = new sql.Request(connection);
	request.query(`SELECT *
	FROM dbo.Loop AS l
    INNER JOIN dbo.LoopMembership AS lm
    ON l.loopId = lm.LoopId
	INNER JOIN dbo.Profile as p
	ON p.ProfileId = lm.ProfileId
	WHERE p.ProfileId = ${req.profileId}`)
		.then((recordset) => {
			res.send(recordset);
		}).catch((err) => {
		return next(err)
	});
});

router.post('/', middleware.verifyToken, function (req, res, next) {
	let request = new sql.Request(connection);
	request.input('LoopId', sql.Int, null);
	request.input('ProfileId', sql.VarChar, req.profileId);
	request.input('LoopName', sql.VarChar, req.body.loopName);
	request.input('Description', sql.VarChar, req.body.loopDescription);
	request.input('IsPrivate', sql.Bit, req.body.isPrivate);
	console.log(req.body)
	request.execute('DBO.Loop_Save').then((recordset) => {
		res.send(recordset[0][0]);
	}).catch((err) => {
		console.log(err)
		return next(err)
	});;
});


export default router;
import {
	Router
} from 'express';
import sql from 'mssql';
import jwt from 'jsonwebtoken';

import db from '../config/db';
import env from '../config/env/development'
import logger from '../config/log';

const connection = db.connection();

function testRoute(req, res, next) {
	let request = new sql.Request(connection);
	request.query('select * from dbo.profile').then((recordset) => {
		res.send(recordset);
	}).catch((err) => {
		return next(err)
	});
}

function login(req, res, next) {
	let request = new sql.Request(connection);
	request.query(`SELECT ProfileiD, FirstName, LastName, Password FROM DBO.PROFILE WHERE EmailAddress = '${req.body.email}'`)
		.then((recordset) => {
			if (recordset.length == 0 || recordset[0].Password != req.body.password) {
				let error = new Error('Username or password is incorrect.');
				error.status = 401;
				return next(error);
			}
			let token = jwt.sign({
				profileId: recordset[0].ProfileiD
			}, env.jwt.secret, {
				expiresIn: "1d"
			});
			let user = {
				id: recordset[0].ProfileiD,
				firstName: recordset[0].FirstName,
				lastName: recordset[0].LastName,
				token: token
			}
			logger.user.info({
				user
			}, "User logged in succesfully");
			res.send(user);
		})
		.catch((err) => {
			return next(err);
		});
}

function signUp(req, res, next) {
	if (req.body.password != req.body.confirmedPassword) {
		let error = new Error('Password does not match');
		error.status = 400;
		return next(error);
	}

	let request = new sql.Request(connection);
	request.input('Fname', sql.VarChar, req.body.firstName);
	request.input('LName', sql.VarChar, req.body.lastName);
	request.input('Email', sql.VarChar, req.body.email);
	request.input('pswd', sql.VarChar, req.body.password);
	request.execute('DBO.PROFILE_CREATE')
		.then((recordsets) => {
			// TODO: check if proc returns profileId
			let user = {
				email: req.body.email,
				firstName: req.body.firstName,
				lastName: req.body.lastName
			}
			res.send(user);
			logger.user.info({
				user
			}, "User signup succesfully");
		})
		.catch((err) => {
			if (err.number == 2627) {
				let error = new Error('Account already exist with the same email');
				error.status = 409;
				return next(error);
			}
			next(err);
		});
}

function getLoops(req, res, next) {
	let request = new sql.Request(connection);
	request.query(`SELECT L.LoopId, Name FROM DBO.PROFILE AS P JOIN DBO.LoopMembership AS M ON
	        P.ProfileId = M.ProfileId
	        JOIN DBO.LOOP AS L ON
	        M.LoopId = L.LoopId
	        WHERE P.ProfileId = ${req.params.id}`)
		.then((recordset) => {
			if (recordset.length == 0) {
				return res.sendStatus(404);
			}
			res.send(recordset);
		})
		.catch((err) => {
			return next(err)
		});
}

function getSurveys(req, res, next) {
	let request = new sql.Request(connection);
	request.query(`SELECT S.SurveyId, SurveyName, Description, CreatedOn FROM DBO.Survey AS S JOIN DBO.SurveyEditorMap AS E ON
	        S.SurveyId = E.SurveyId
	        WHERE E.ProfileId = ${req.params.id}`)
		.then((recordset) => {
			if (recordset.length == 0) {
				return res.sendStatus(404);
			}
			res.send(recordset);
		})
		.catch((err) => {
			return next(err)
		});
}

function getAttributes(req, res, next) {
	let ps = new sql.Request(connection);
	ps.query("SELECT * FROM DBO.ProfileAttribute")
		.then((recordset) => {
			res.send(recordset);
		})
		.catch((err) => {
			return next(err)
		});
}

function errorHandler(err, req, res, next) {
	logger.user.error(err);
	return next(err);
}

export default {
	testRoute,
	login,
	signUp,
	getLoops,
	getAttributes,
	getSurveys,
	errorHandler
}
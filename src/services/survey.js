import {
	Router
} from 'express';
import sql from 'mssql';
import validate from 'express-validation';

import db from '../config/db';
import middleware from '../config/middleware';
import schema from '../validators/survey';
import logger from '../config/log';
import questionUtils from '../utils/question';
import constants from '../utils/constants';

const connection = db.connection();

const SURVEY_PER_PAGE = 5;

function getAll(req, res, next){
	let page = (req.query.page > 0 ? req.query.page : 0) * SURVEY_PER_PAGE;
	let request = new sql.Request(connection);
	request.query(`SELECT surveyId, surveyName, description, createdOn
                  FROM DBO.SURVEY
                  ORDER BY surveyId OFFSET ${page} ROWS FETCH NEXT ${SURVEY_PER_PAGE} ROWS ONLY`)
		.then((recordset) => {
			let result = recordset.map((survey) => {
				return {
					name: survey.surveyName,
					id: survey.surveyId,
					description: survey.description,
					createdOn: survey.createdOn,
					questionTitle: survey.QUESTIONTEXT
				}
			});
			res.send(result);
		}).catch((err) => {
		return next(err)
	});
}

function getSurvey(req, res, next){
	let request = new sql.Request(connection);
	request.query(`SELECT surveyId, surveyName, description, createdOn FROM DBO.SURVEY WHERE surveyId = ${req.params.surveyId}`)
		.then((recordset) => {
			if (recordset.length == 0) {
				return res.sendStatus(404);
			}
			res.send(recordset[0]);
		}).catch((err) => {
		return next(err)
	});
}

function getQuestions(req, res, next){
	let request = new sql.Request(connection);
	request.input('CurrentSurveyID', sql.Int, req.params.surveyId);
	request.execute('DBO.SurveyQuestions_Load')
		.then((recordset) => {
			if (recordset[0].length == 0 || recordset[1].length == 0) {
				return res.sendStatus(404);
			}
			let questions = [];
			let lastId = null;
			let currentQuestion = null;
			recordset[1].forEach((questionAttribute) => {
				// Found a new question
				if (lastId != questionAttribute.QuestionID) {
					// Create Question and push it to the array of questions
					currentQuestion = {
						questionId: questionAttribute.QuestionID
					};
					questions.push(currentQuestion);
					lastId = questionAttribute.QuestionID;
					// Set Question Type and title for the question
					currentQuestion.questionType = constants.QUESTION_TYPES_DB[questionAttribute.QuestionTypeName];
					currentQuestion.title = questionAttribute.QuestionText;
				}
				// Set attribute property and its value
				currentQuestion[constants.QUESTION_ATTRIBUTES[questionAttribute.AttributeName]] = questionUtils.getAttributeValue(questionAttribute);
			});
			
			// for choices and slider scale
			if(recordset[2].length) {
				let question = null;
				recordset[2].forEach((choice) => {
					question = questions[choice.QuestionOrder];
					question[constants.QUESTION_ATTRIBUTES[choice.AttributeName]] = questionUtils.getAttributeValue(choice, question[constants.QUESTION_ATTRIBUTES[choice.AttributeName]])
				});
			}

			var surveyDetails = recordset[0][0];
			res.send({
				name: surveyDetails.SurveyName,
				description: surveyDetails.Description,
				createdOn: surveyDetails.CreatedOn,
				createdBy: surveyDetails.CreatedByName,
				questions
			});
		}).catch((err) => {
		return next(err)
	});
}

function postSurvey(req, res, next){
	let surveyId = null;
	// Check questions format
	checkQuestions(req.body.questions);
	createSurvey(req.profileId, req.body)
		.then((recordset) => {
			logger.survey.debug("Survey Created with id: ", recordset[0][0]);
			surveyId = recordset[0][0].SurveyID;
			// For all questions create a promise for the request to the db
			return req.body.questions.map((question, index) => {
				return createQuestion(surveyId, req.profileId, question, index);
			});
		})
		.then((promises) => {
			// wait for all promises to finish
			return Promise.all(promises);
		})
		.then((questionResult) => {
			logger.survey.debug({questionResult}, "Question promises result:");
			res.send({
				surveyId
			});
		})
		.catch((err) => {
			return next(err);
		});
}

function answerSurvey(req, res, next){
	console.log(req.body);
}

function errorHandler(err, req, res, next){
	logger.survey.error(err);
	return next(err);
}

function checkQuestions(questions) {
	questions.forEach((question, index) => {
		question.typeId = questionUtils.getQuestionTypeId(question.questionType, index);
		question.detailsArray = questionUtils.getQuestionAttributesInfo(question, index);
	});
}

// Create or Edit survey
function createSurvey(profileId, survey) {
	logger.survey.info({survey}, "Creating survey:");
	// Its a new survey, set it to null
	if (survey.surveyId === undefined) {
		logger.survey.debug("Survey Id is null");
		survey.surveyId = null;
	}

	let loopTable = new sql.Table();

	// Columns must correspond with type we have created in database.
	loopTable.columns.add('SurveyID', sql.Int, {
		nullable: true
	});
	loopTable.columns.add('LoopID', sql.Int);

	survey.loops.forEach((loop) => {
		// Add rows
		loopTable.rows.add(survey.surveyId, loop.loopId); // Values are in same order as columns.
	});

	let attributeTable = new sql.Table();

	attributeTable.columns.add('SurveyID', sql.Int, {
		nullable: true
	});
	attributeTable.columns.add('ProfileAttributeID', sql.Int);

	survey.attributes.forEach((attribute) => {
		attributeTable.rows.add(survey.surveyId, attribute.attributeId);
	});

	let request = new sql.Request(connection);
	request.input('SurveyID', sql.Int, survey.surveyId);
	request.input('SurveyName', sql.VarChar, survey.name);
	request.input('Description', sql.VarChar, survey.description);
	request.input('EditedBy', sql.Int, profileId);
	request.input('LoopAssignmentList', loopTable);
	request.input('SurveyProfileAttributeAssignList', attributeTable);
	return request.execute('DBO.SURVEY_SAVE');
}

function createQuestion(surveyId, profileId, question, index) {
	logger.survey.info({question}, "Creating question:");
	if (question.questionId === undefined) {
		logger.survey.debug("Question Id is null");
		question.questionId = null;
	}

	let questionDetails = new sql.Table();
	questionDetails.columns.add('QuestionID', sql.Int, {
		nullable: true
	});
	questionDetails.columns.add('QuestionAttributeID', sql.Int);
	questionDetails.columns.add('QuestionAttributeValue', sql.VarChar);

	question.detailsArray.forEach((attribute) => {
		questionDetails.rows.add(question.questionId, attribute.id, attribute.value);
	})

	let request = new sql.Request(connection);
	request.input('QuestionID', sql.Int, question.questionId);
	request.input('SurveyID', sql.Int, surveyId);
	request.input('QuestionTypeID', question.typeId);
	request.input('QuestionText', sql.VarChar, question.title);
	request.input('QuestionOrder', sql.Int, index);
	request.input('QuestionDetailSet', questionDetails);
	request.input('EditedBy', sql.Int, profileId);
	return request.execute('DBO.Question_Save');
}

export default {
	getAll,
	getSurvey,
	getQuestions,
	postSurvey,
	answerSurvey,
	errorHandler
}
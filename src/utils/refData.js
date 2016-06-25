import sql from 'mssql';

import db from '../config/db';

const connection = db.connection();

var questionAttributes = {};
var questionTypes = {};
var questionAttibuteTypeMap = {}

function initRefData() {
	getQuestionAttributes();
	getQuestionTypes();
	getAttributeTypeMap();
}

function getQuestionAttributes() {
	var request = new sql.Request(connection);
	return request.query('SELECT * FROM DBO.QuestionAttribute')
		.then((recordset) => {
			questionAttributes = {};
			recordset.forEach((attribute) => {
				questionAttributes[attribute.AttributeName] = attribute.QuestionAttributeID;
			});
			return questionAttributes;
		}).catch((err) => {
			return next(err)
		});
}

function getQuestionTypes() {
	var request = new sql.Request(connection);
	return request.query('SELECT * FROM DBO.QuestionType')
		.then((recordset) => {
			questionTypes = {};
			recordset.forEach((type) => {
				questionTypes[type.Name] = type.QuestionTypeID;
			});
			return questionTypes;
		}).catch((err) => {
			return next(err)
		});
}

function getAttributeTypeMap() {
	var request = new sql.Request(connection);
	return request.query(`select t.questiontypeid, a.questionattributeid, a.attributename from dbo.questiontype t join dbo.QuestionAttributeTypeMap m on t.questiontypeid = m.questiontypeid
join dbo.questionattribute a on a.questionattributeid = m.questionattributeid`)
		.then((recordset) => {
			questionAttibuteTypeMap = {};
			recordset.forEach((questionMap) => {
				let attributeObject = { id: questionMap.questionattributeid, name: questionMap.attributename};
				if (!questionAttibuteTypeMap[questionMap.questiontypeid]) {
					questionAttibuteTypeMap[questionMap.questiontypeid] = [attributeObject];
				} else {
					questionAttibuteTypeMap[questionMap.questiontypeid].push(attributeObject)
				}
			});
			return questionAttibuteTypeMap;
		}).catch((err) => {
			return next(err)
		});
}

export default {
	initRefData,
	getQuestionAttributes: () => questionAttributes,
	getQuestionTypes: () => questionTypes,
	getAttributeTypeMap: () => questionAttibuteTypeMap,
	refreshQuestionAttributes: getQuestionAttributes,
	refreshAttributeTypeMap: getAttributeTypeMap,
	refreshQuestionTypes: getQuestionTypes,
}
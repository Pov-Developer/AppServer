import logger from '../config/log';
import refData from '../utils/refData'

function getQuestionAttributes(req, res, next){
	res.send(refData.getQuestionAttributes());
}

function getQuestionTypes(req, res, next){
	res.send(refData.getQuestionTypes());
}

function getAttributeTypeMap(req, res, next){
	res.send(refData.getAttributeTypeMap());
}

function errorHandler(err, req, res, next){
	logger.question.error(err);
	return next(err);
}

export default{
	getQuestionAttributes,
	getQuestionTypes,
	getAttributeTypeMap,
	errorHandler
}
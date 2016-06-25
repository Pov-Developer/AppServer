import constants from './constants';
import refData from './refData';

function getQuestionTypeId(questionType, index) {
	let typeId = refData.getQuestionTypes()[constants.QUESTION_TYPES_REQUEST[questionType]]
	if (!typeId) {
		let error = new Error('Invalid Question Type in question ' + index);
		error.status = 400;
		throw error;
	}
	return typeId;
}

function getQuestionAttributesInfo(question, index) {
	// Get allow attributes for the question type
	let requiredAttributes = refData.getAttributeTypeMap()[question.typeId];
	let attributeArray = [];
	let scaleRepeated = false;
	requiredAttributes.forEach((attribute) => {
		// Get question attribute
		let attributeValue = question[constants.QUESTION_ATTRIBUTES[attribute.name]];
		// Check if attribute is missing in the request
		if (attributeValue === undefined) {
			// Question is invalid throw error
			let error = new Error(`Missing Question Attribute ${constants.QUESTION_ATTRIBUTES[attribute.name]} in question #${index}`);
			error.status = 400;
			throw error;
		} else {
			// Special case for choices
			if (constants.QUESTION_ATTRIBUTES[attribute.name] == "choices") {
				attributeArray.push({
					id: attribute.id,
					value: flattenChoices(attributeValue)
				});
			}
			// Special case for scale...
			else if (constants.QUESTION_ATTRIBUTES[attribute.name] == 'scale') {
				if (!scaleRepeated) {
					let scaleId = null;
					// Check which scale is it
					requiredAttributes.forEach((scaleAttribute) => {
						if (scaleAttribute.name == ("Scale_" + attributeValue.name)) {
							scaleId = scaleAttribute.id;
						}
					});
					// If scale not found throw error
					if (!scaleId) {
						let error = new Error('Invalid Question Scale Name in question ', index);
						error.status = 400;
						throw error;
					}
					// Do not repeat scale
					scaleRepeated = true;
					attributeArray.push({
						id: scaleId,
						value: attributeValue.steps.join("|")
					});
				}
			} else {
				attributeArray.push({
					id: attribute.id,
					value: attributeValue
				});
			}
		}
	});
	return attributeArray;
}

function flattenChoices(choices) {
	return choices.reduce((previousValue, currentValue) => previousValue + (previousValue ? "|" : "" ) + currentValue.text, "");
}

function getAttributeValue(question, currVal) {
	let name = question.AttributeName;
	let value = question.QuestionAttributeValue;
	if (name == "Required" || name == "Randomize") {
		return value == "true";
	}
	else if (name == "Choices") {
		if(!currVal)
			return [{
				choiceId: question.ChoiceID,
				text: question.ChoiceValue
			}];
		currVal.push({
			choiceId: question.ChoiceID,
			text: question.ChoiceValue
		});
		return currVal;
	}
	else if (name == "Text_Char_Min" || name == "Text_Char_Max" || name == "NumberBox_Min" || name == "NumberBox_Max") {
		return parseInt(value);
	}
	else if (name.split("_")[0] == "Scale") {
		if(!currVal){
			return {
				name: name.split("_")[1],
				steps: [{
					choiceId: question.ChoiceID,
					text: question.ChoiceValue
				}]
			}
		}
		currVal.steps.push({
			choiceId: question.ChoiceID,
			text: question.ChoiceValue
		});
		return currVal;
	}
}

export default {
	getQuestionTypeId,
	getQuestionAttributesInfo,
	getAttributeValue
}
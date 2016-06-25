import Joi from 'joi';

const survey = {
  body: {
    
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    
    loops: Joi.array().items(Joi.object().keys({
      loopId: Joi.number().required()
    })).required(),
    
    attributes: Joi.array().items(Joi.object().keys({
      attributeId: Joi.number().required()
    })).required(),
    
    questions: Joi.array().items(Joi.object().keys({
      
      required: Joi.boolean().required(),
      questionType: Joi.string().required(),
      title: Joi.string().required(),

      //multiple choice and ranking
      choices: Joi.array().items(Joi.object()).optional(),
      randomize: Joi.boolean().optional(),

      //text
      minChars: Joi.number().optional(),
      maxChars: Joi.number().optional(),

      //number
      minNumber: Joi.number().optional(),
      maxNumber: Joi.number().optional(),

      //slider
      scale: Joi.object().keys({
        name: Joi.string().required(),
        steps: Joi.array().required()
      }).optional()

    })).required()
  }
}

const getSurvey = {
  params:{
    surveyId: Joi.number().positive().required()
  }
}

export default {
  survey,
  getSurvey
};
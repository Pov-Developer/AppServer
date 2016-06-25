import {
	Router
} from 'express';
import validate from 'express-validation';

import middleware from '../config/middleware';
import schema from '../validators/survey';
import surveyService from '../services/survey';

var router = Router();

// GET SURVEYS
router.get('/', surveyService.getAll);

// GET A SURVEY
router.get('/:surveyId', validate(schema.getSurvey), surveyService.getSurvey);

// GET A SURVEY'S QUESTIONS
router.get('/:surveyId/questions', validate(schema.getSurvey), surveyService.getQuestions);

// POST SURVEY (CREATE)
router.post('/', middleware.verifyToken, validate(schema.survey), surveyService.postSurvey);

router.post('/answer', surveyService.answerSurvey);

// Error handler for survey route
router.use(surveyService.errorHandler);

export default router;
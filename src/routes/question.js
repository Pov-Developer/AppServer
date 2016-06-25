import {
  Router
} from 'express';

import questionService from '../services/question'

var router = Router();

router.get('/attributes', questionService.getQuestionAttributes);

router.get('/types', questionService.getQuestionTypes);

router.get('/map', questionService.getAttributeTypeMap);

// Error handler for question route
router.use(questionService.errorHandler);

export default router;
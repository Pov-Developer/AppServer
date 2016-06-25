import user from '../routes/user';
import survey from '../routes/survey';
import question from '../routes/question';
import loops from '../routes/loops';

export default function routes(app) {
	app.use('/users', user);
	app.use('/surveys', survey);
	app.use('/questions', question);
	app.use('/loops', loops);
}
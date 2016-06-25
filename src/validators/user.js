import Joi from 'joi';

const login = {
	options: {
		allowUnknownBody: false
	},
	body: {
		email: Joi.string().email().required(),
		password: Joi.string().required()
	}
};

const signUp = {
	body: {
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		confirmedPassword: Joi.string().required(),
		firstName: Joi.string().required(),
		lastName: Joi.string().required()
	}
};

const loops = {
	options: {
		allowUnknownBody: false
	},
	params: {
		id: Joi.number().positive().required()
	}
};

const surveys = {
	options: {
		allowUnknownBody: false
	},
	params: {
		id: Joi.number().positive().required()
	}
};

export default {
	login,
	signUp,
	loops,
	surveys
};
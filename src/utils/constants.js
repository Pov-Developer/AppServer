// map questionType in the request to the question type map in refData
const QUESTION_TYPES_REQUEST = {
  multipleChoice: 'Multiple Choice',
  textBox: 'Text Box',
  sliderScale: 'Slider Scale',
  ranking: 'Ranking',
  numberBox: 'Number Box'
}

// Maps DB type names to front end friendly names
const QUESTION_TYPES_DB = {
  'Multiple Choice': 'multipleChoice',
  'Text Box': 'textBox',
  'Slider Scale': 'sliderScale',
  'Ranking': 'ranking',
  'Number Box': 'numberBox'
}

// maps question attribute in refData with the properties in the request
const QUESTION_ATTRIBUTES = {
  Choices: 'choices',
  Required: 'required',
  Randomize: 'randomize',
  Text_Char_Min: 'minChars',
  Text_Char_Max: 'maxChars',
  Scale_Frequency: 'scale',
  Scale_Opinion: 'scale',
  Scale_Agreement: 'scale',
  NumberBox_Min: 'minNumber',
  NumberBox_Max: 'maxNumber'
}

export default {
  QUESTION_TYPES_REQUEST,
  QUESTION_TYPES_DB,
  QUESTION_ATTRIBUTES
}
import TextInput from './TextInput';
import ChoiceInput from './ChoiceInput';
import RatingInput from './RatingInput';
import BooleanInput from './BooleanInput';

const QUESTION_COMPONENTS = {
  text: TextInput,
  multiple_choice: ChoiceInput,
  single_choice: ChoiceInput,
  checkbox: ChoiceInput,
  dropdown: ChoiceInput,
  rating: RatingInput,
  scale: RatingInput,
  boolean: BooleanInput,
};

export default QUESTION_COMPONENTS;
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Notes from '../VisComponents/NotesVis';
import NotesForm from './NotesForm';

const getCurrentTimestamp = () => {
  return new Date().toLocaleString();
};

const ensureNotesOptions = (options = {}) => {
  return {
    title: '',
    noteType: 'None',
    noteColor: '#FFF7CC',
    textColor: '#000000',
    signature: '',
    content: '',
    created: '',
    modified: '',
    extent: {
      width: 400,
      height: 300,
    },
    ...options,
    extent: {
      width: 400,
      height: 300,
      ...(options.extent || {}),
    },
  };
};

export default class NotesView extends withCommandInterface(Notes, NotesForm) {

  handleSubmit = (values) => {
    const { id, updateView } = this.props;

    let newValues = { ...values };

    newValues.options = ensureNotesOptions(newValues.options);

    if (!newValues.options.created) {
      newValues.options.created = getCurrentTimestamp();
    }

    newValues = convertExtentValues(newValues);

    updateView(id, newValues);
  };

  mapData = () => {
    return {};
  };
}

// import { connect } from 'react-redux';

import withCommandInterface from './ViewWrapper';
import Scatter from '../VisComponents/Scatter';
import ScatterForm from './ScatterForm';

import convertExtentValues from './FormUtils';

class ScatterView extends withCommandInterface(Scatter, ScatterForm) {
  handleSubmit = (values) => {
    // console.log(values)
    const { id, updateView, colorTags } = this.props;

    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    if (!values.colorAssignmentEnabled) {
      newValues.mappings.color = '';
    }

    newValues = convertExtentValues(newValues);

    updateView(id, newValues);
  };
}

export default ScatterView;

import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import PeriodicTableChart from '../VisComponents/PeriodicTableChart';
import PeriodicTableForm from './PeriodicTableForm';

import $ from 'jquery';

import convertExtentValues from './FormUtils';

class PeriodicTableView extends withCommandInterface(PeriodicTableChart, PeriodicTableForm) {

  handleSelectionChange = (indices) => {
  };

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    newValues = convertExtentValues(newValues);

    updateView(id, newValues);
  };

  mapData = (dataset) => {
    return dataset;
  };
}

export default PeriodicTableView;

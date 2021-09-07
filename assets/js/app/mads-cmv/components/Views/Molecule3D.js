import withCommandInterface from './ViewWrapper';
import Molecule3D from '../VisComponents/Molecule3D';
import Molecule3DForm from './Molecule3DForm';

import convertExtentValues from './FormUtils';

import { DataFrame } from 'pandas-js';
import _ from 'lodash';


class Molecule3DView extends withCommandInterface(Molecule3D, Molecule3DForm) {

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    // extract and insert data
    let data = {
      name: newValues.molName,
      formula: newValues.molForm,
      url: newValues.molUrl,
      smiles: newValues.molSmiles,
      data: newValues.molStr,
    };
    newValues["data"] = data;

    newValues = convertExtentValues(newValues);
    updateView(id, newValues);
  };


  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }

    return data;
  };
}

export default Molecule3DView;

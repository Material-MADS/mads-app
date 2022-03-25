/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Molecule3D' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Molecule3D' is the manager of all current input that controls the final view of the
//         'Molecule3D' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal Molecule3D & Molecule3DForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Molecule3D from '../VisComponents/Molecule3D';
import Molecule3DForm from './Molecule3DForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class Molecule3DView extends withCommandInterface(Molecule3D, Molecule3DForm) {

  // Manages config settings changes (passed by the connected form) in the view
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
      fileExt: newValues.fileExt,
    };
    newValues["data"] = data;

    newValues = convertExtentValues(newValues);
    updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Scatter' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Scatter' is the manager of all current input that controls the final view of the
//         'Scatter' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal Scatter & ScatterForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Scatter from '../VisComponents/Scatter';
import ScatterForm from './ScatterForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ScatterView extends withCommandInterface(Scatter, ScatterForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
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
//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'Periodic Table' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'PeriodicTable' is the manager of all current input that controls the final view of the
//         'PeriodicTableChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal PeriodicTableChart & PeriodicTableForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import PeriodicTableChart from '../VisComponents/PeriodicTableChart';
import PeriodicTableForm from './PeriodicTableForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class PeriodicTableView extends withCommandInterface(PeriodicTableChart, PeriodicTableForm) {

  // Manages data selection changes in the view
  handleSelectionChange = (indices) => {
  };

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    newValues = convertExtentValues(newValues);

    updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    return dataset;
  };
}
//-------------------------------------------------------------------------------------------------

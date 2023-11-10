/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'TensorFlow' View
// ------------------------------------------------------------------------------------------------
// Notes: 'TensorFlow' is the manager of all current input that controls the final view of the
//         'TensorFlow' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal TensorFlow & TensorFlowForm libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import TensorFlow from '../VisComponents/TensorFlowVis';
import TensorFlowForm from './TensorFlowForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class TensorFlowView extends withCommandInterface(TensorFlow, TensorFlowForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    let data = {};

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

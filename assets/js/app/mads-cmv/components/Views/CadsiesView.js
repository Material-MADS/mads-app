/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'Cadsies - Custom Mini App' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Cadsies - Custom Mini App' is the manager of all current input that controls the final
//        view of the 'Cadsies - Custom Mini App' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "Cadsies - Custom Mini App"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Cadsies from '../VisComponents/CadsiesVis';
import CadsiesForm from './CadsiesForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class CadsiesView extends withCommandInterface(Cadsies, CadsiesForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    let data = {data: dataset.main.data};

    newValues = convertExtentValues(newValues);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if((dataset && dataset.main && dataset.main.schema && dataset.main.schema.fields)){
      if((dataset.main.schema.fields.some(e => e.name === "elemParam")) && (dataset.main.schema.fields.some(e => e.name === "objParam"))){
        data = {data: dataset.main.data};
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

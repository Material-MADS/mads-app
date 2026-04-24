/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'cads_component_template' View
// ------------------------------------------------------------------------------------------------
// Notes: 'cads_component_template' is the manager of all current input that controls the final
//        view of the 'cads_component_template' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "cads_component_template"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import MLP_Component from '../VisComponents/MLPVis';
import MLP_Component_Form from './MLPForm';

//-------------------------------------------------------------------------------------------------

const settings = {
  options: { title: 'MLP Regression' },
};


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------


export default class MLP_Component_View extends withCommandInterface(MLP_Component, MLP_Component_Form) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    let data = { content: "No" };
    
    newValues = convertExtentValues(newValues);

    const value = newValues.options.anotherThing;
    newValues.options.anotherThing = isNaN(Number(value)) ? 0 : Number(value);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };



  //



  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
      data["theAnswer"] = 42;
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

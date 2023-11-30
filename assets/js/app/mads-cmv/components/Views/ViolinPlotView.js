/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'GapMinder' Plot View
// ------------------------------------------------------------------------------------------------
// Notes: 'GapMinder' is the manager of all current input that controls the final view of the
//         'GapMinder' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal GapMinder & GapMinderForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import ViolinPlotVis from '../VisComponents/ViolinPlotVis';
import ViolinPlotForm from './ViolinPlotForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ViolinPlotView extends withCommandInterface(ViolinPlotVis, ViolinPlotForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // extract data
    let theData = dataset.main.data;

    newValues = convertExtentValues(newValues);
    newValues.data = {data: theData};

    updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    let data = {};

    var dataFields = this.props.dataset.main.schema ? this.props.dataset.main.schema.fields.map(a => a.name) : [];
    var currUsedField = this.props.view.settings.options.numDataAxis;

    if (dataFields.length > 0 && currUsedField != undefined && !dataFields.some(e => e === currUsedField)) {
      if(this.props.view.settings){
        this.props.view.settings.data = {};
        this.props.view.settings.options = {};
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Custom' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Custom' is the manager of all current input that controls the final view of the
//         'CustomVS' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal CustomVC & CustomForm libs,
=================================================================================================*/

//*** TODO: This is yet not implemented into the application and is still under construction

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import CatalystGene from '../VisComponents/CatalystGeneVis';
import CatalystGeneForm from './CatalystGeneForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class CatalystGeneView extends withCommandInterface(CatalystGene, CatalystGeneForm) {

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset,  } = this.props;
    let newValues = { ...values };
    console.log(dataset);

    // extract data
    let internalData = dataset.main.data;
    const df = new DataFrame(internalData);
    const columns = [];
    dataset.main.schema.fields.map(c => columns.push(c['name']));
    const listToChoose = [...newValues.featureColumns];
    listToChoose.push("Catalyst")
    console.log(listToChoose)
    const s = df.get(listToChoose);
    const data = s.values.toArray();

    newValues = convertExtentValues(newValues);
    // console.log(newValues)
    actions.sendRequestViewUpdate(view, newValues, dataset);
  };


  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      // const testColumn = this.props.view.settings.targetColumn || (this.props.view.settings.options?(this.props.view.settings.options.axisTitles?this.props.view.settings.options.axisTitles[0]:undefined):undefined)
      if (dataset[id]) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

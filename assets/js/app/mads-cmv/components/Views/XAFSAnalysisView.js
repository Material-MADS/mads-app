/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'XAFSAnalysis'
//              View
// ------------------------------------------------------------------------------------------------
// Notes: 'XAFSAnalysis' is the manager of all current input that controls the final view of the
//         'XAFSAnalysis' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal XAFSAnalysis & ClassificationForm libs,
=================================================================================================*/

//*** TODO: Could this be deleted, and just leave the Scatter Plot with some new settings to replace them

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import XAFSAnalysisVis from '../VisComponents/XAFSAnalysisVis';
import XAFSAnalysisForm from './XAFSAnalysisForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: { title: 'XAFSAnalysis' },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class XAFSAnalysisView extends withCommandInterface( XAFSAnalysisVis, XAFSAnalysisForm, settings ) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, colorTags, actions, dataset, updateView } = this.props;
    let newValues = { ...values };

    console.log("values: ", values); // デバッグ用ログ

    // extract data
    const data = { };
    const df = new DataFrame(dataset.main.data);
    const tc1 = df.get(newValues.energy);
    const tc2 = df.get(newValues.abs);
    data[newValues.energy] = tc1.values.toArray();
    data[newValues.abs] = tc2.values.toArray();
    data['RawData_Xname'] = values.energy;
    data['RawData_Yname'] = values.abs;

    console.log("Submitted Values Received: ", values); // デバッグ用ログ
    console.log("File Data: ", values.XANES_Data); // デバッグ用ログ
    console.log("File Data: ", data); // デバッグ用ログ
    console.log('X_name:', values.energy);

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id, view, actions } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
      console.log(dataset[id])      
    }

    // console.log(data)

    return data;
  };
  
}
//-------------------------------------------------------------------------------------------------

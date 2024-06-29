/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'CatalystPropertyConversionView' View
// ------------------------------------------------------------------------------------------------
// Notes: 'CatalystPropertyConversionView' is the manager of all current input that controls the 
//        final view of the 'CatalystPropertyConversionView' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "CatalystPropertyConversionView"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import CatalystPropertyConversion from '../VisComponents/CatalystPropertyConversionVis';
import CatalystPropertyConversionForm from './CatalystPropertyConversionForm';
import { DataFrame } from 'pandas-js';
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class CatalystPropertyConversionView extends withCommandInterface(CatalystPropertyConversion, CatalystPropertyConversionForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    //Excute in common  
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };
    // console.log(newValues)

    const data = {};
    const df = new DataFrame(dataset.main.data);

    newValues.catalyst.forEach(c => {
      const dc = df.get(c);
      data[c] = dc.values.toArray();

    });
    
    //if user select target columns
    if (newValues.targetColumns.length !== 0 ) {
      newValues.targetColumns.forEach(c => {
        const tc = df.get(c);
        data[c] = tc.values.toArray();
      })
    }

    //if user select weighted average(format B)
    if (newValues.compositionColumns.length !== 0 && newValues.conversionMethod === "Weighted Average (Format B)") {
      newValues.compositionColumns.forEach((c) => {
        const cc = df.get(c);
        data[c] = cc.values.toArray();
      })
    }

    newValues = convertExtentValues(newValues);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};
    // console.log(dataset)

    if (dataset[id]) {

      data = dataset[id]
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------

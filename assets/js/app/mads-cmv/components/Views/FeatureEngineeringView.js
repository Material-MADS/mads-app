/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'FeatureEngineering' View
// ------------------------------------------------------------------------------------------------
// Notes: 'FeatureEngineering' is the manager of all current input that controls the final
//        view of the 'FeatureEngineering' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "FeatureEngineering"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import FeatureEngineering from '../VisComponents/FeatureEngineeringVis';
import FeatureEngineeringForm from './FeatureEngineeringForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class FeatureEngineeringView extends withCommandInterface(FeatureEngineering, FeatureEngineeringForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };
    // console.log('default', newValues)

    // // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);

    newValues.targetColumns.forEach((c) => {
      const tc = df.get(c);
      data[c] = tc.values.toArray();
    })

    newValues.descriptorColumns.forEach((c) => {
      const dc = df.get(c);
      data[c] = dc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
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

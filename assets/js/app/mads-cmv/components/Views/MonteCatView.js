/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// _________________________________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'MonteCat' View
// ------------------------------------------------------------------------------------------------
// Notes: 'MonteCat' is the manager of all current input that controls the final
//        view of the 'MonteCat' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "MonteCat"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import MonteCat from '../VisComponents/MonteCatVis';
import MonteCatForm from './MonteCatForm';
import { DataFrame } from 'pandas-js';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class MonteCatView extends withCommandInterface(MonteCat, MonteCatForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    //Blank data
    if (values.targetColumn == '') {
      throw new Error('The Error for Blank Duplicate');
    }
    
    const data = {};
    //Selected Data Surce is Data Management
    if (newValues.selectedDataSource === 'Data Management') {
      const columns = this.getColumnOptionArray();
  
      const df = new DataFrame(dataset.main.data);
  
      //extract descriptor and target columns
      if (newValues.targetColumn) {
        const datasetColumns = columns.filter((column) => column !== 'index');
        datasetColumns.forEach((c) => {
          const dc = df.get(c);
          data[c] = dc.values.toArray();
        })
      }
    }
    
    newValues = convertExtentValues(newValues);
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

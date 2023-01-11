/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'NodeGraph' View
// ------------------------------------------------------------------------------------------------
// Notes: 'NodeGraph' is a network visualization component that displays an interactive node - link
//        graph.
// ------------------------------------------------------------------------------------------------
// References: 3rd party lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal NodeGraph & NodeGraphForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import _ from 'lodash';
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import NodeGraph from '../VisComponents/NodeGraph';
import NodeGraphForm from './NodeGraphForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class NodeGraphView extends withCommandInterface(NodeGraph, NodeGraphForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    if(dataset == undefined){ throw "No data to work with" }
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    let internalData = dataset.main.data;



    let data = internalData.map( (v) => {
      var newDataObj = {};
      newDataObj['sn'] = v[newValues.sourceNodeColumn] == null ? "NULL" : String(v[newValues.sourceNodeColumn]);
      newDataObj['tn'] = v[newValues.targetNodeColumn] == null ? "NULL" : String(v[newValues.targetNodeColumn]);
      newDataObj['lw'] = parseInt(v[newValues.linkWeightColumn]);

      return newDataObj
    })

    newValues["data"] = {linkList: data};
    newValues = convertExtentValues(newValues);

    // actions.sendRequestViewUpdate(view, newValues,  newValues["data"]);
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

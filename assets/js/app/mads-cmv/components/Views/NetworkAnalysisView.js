/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q6 2024
// ________________________________________________________________________________________________
// Authors: Akihiro Honda
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'NetworkAnalysis' 
//              Plot View
// ------------------------------------------------------------------------------------------------
// Notes: 'NetworkAnalysis' is the manager of all current input that controls the final view of the
//         'NetworkAnalysis' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal NetworkAnalysis & NetworkAnalysisForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import NetworkAnalysis from '../VisComponents/NetworkAnalysisVis';
import NetworkAnalysisForm from './NetworkAnalysisForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class NetworkAnalysisView extends withCommandInterface(NetworkAnalysis, NetworkAnalysisForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    console.log('newValues')
    console.log(newValues)

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    // extract data
    let internalData = dataset.main.data;
    let linklists = internalData.map( (v) => {
      var newDataObj = {};
      newDataObj['sn'] = v[newValues.sourceNodeColumn] == null ? "NULL" : String(v[newValues.sourceNodeColumn]);
      newDataObj['tn'] = v[newValues.targetNodeColumn] == null ? "NULL" : String(v[newValues.targetNodeColumn]);
      newDataObj['lw'] = v[newValues.linkWeightColumn] == undefined ? '1' : (v[newValues.linkWeightColumn]);

      return newDataObj
    })

    // console.log(data)
    // console.log(view)
    // console.log(newValues)
    if(newValues.centrality == 'Not Applicable') {newValues.centrality = ''}
    if(newValues.graphLayout == undefined) {newValues.graphLayout = 'Force-Directed Layouts'}
    if(newValues.clusteringMethod == undefined) {newValues.clusteringMethod = 'Greedy'}
    if(newValues.nodeGradient == undefined) {newValues.nodeGradient = 'RtB'}
    if(newValues.linkGradient == undefined) {newValues.linkGradient = 'BtG'}
    let remainNodes = (newValues.remainLonelyNodes ? true : false)
    let deleteNetworks = (newValues.deleteIsolatedNetworks ? true : false)
    let clustering = (newValues.clusteringEnabled ? true : false)
    let makeUndirectedGraph = (newValues.makeUndirectedGraph ? true : false)
    let makePetriNet = (newValues.makePetriNet ? true : false)

    console.log(newValues.options.gradient)
    let data = {
      linkList: linklists,
      centralityType: newValues.centrality,
      remainLonelyNodes: remainNodes,
      deleteIsolatedNetworks: deleteNetworks,
      markNode: newValues.markNode,
      clustering: clustering,
      clusteringMethod: newValues.clusteringMethod,
      graphLayout: newValues.graphLayout,
      nodeGradient: newValues.nodeGradient,
      linkGradient: newValues.linkGradient,
      makeUndirected: makeUndirectedGraph,
      isPetriNet: makePetriNet,
      clusteringForce: newValues.clusterForce,
      nodeAttraction: newValues.nodeAttraction
    };
    newValues = convertExtentValues(newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }
    // console.log("data in map")
    // console.log(data)
    
    return data;
  };
}
//-------------------------------------------------------------------------------------------------
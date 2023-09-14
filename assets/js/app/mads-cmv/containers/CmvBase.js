/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'CmvBase' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'CmvBase' is the main workspace area of the analysis page that provides us with
//        possibilities that allows us to add different views (visualization components) in order
//        to study the selected data.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CmvBase from '../components/CmvBase';
import * as Actions from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state) => ({
  dataSources: state.dataSources.items,
  selectedDataSource: state.dataSources.selectedDataSource,
  views: state.views,
  dataset: state.dataset,
  selection: state.selection,
  colorTags: state.colorTags,
  userInfo: state.userInfo,
});
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available actions contained in this container
//-------------------------------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => ({
  dispatch,
  actions: bindActionCreators(Actions, dispatch),
});
//-------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(CmvBase);

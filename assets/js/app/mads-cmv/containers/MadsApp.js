/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'MadsApp' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'MadsApp' is the all surrounding part of the analysis page that provides us with all
//        available possibilities that allows us to interact with the page in various ways.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import App from '../App';
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
  isLoading: state.loading.isLoading,
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

const MadsApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default MadsApp;

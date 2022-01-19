/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'DataSourceSelector' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'DataSourceSelector' is a part of the analysis page that provides us with possibilities
//        that allows us to change which current data we ara analyzing in the current workspace.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';

import DataSourceSelector from '../components/DataSourceSelector';
import * as actions from '../actions/datasources';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => ({
  dataSources: state.dataSources.items,
  selectedDataSource: state.dataSources.selectedDataSource,
});
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available actions contained in this container
//-------------------------------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => ({
  onMount() {
    dispatch(actions.fetchDataSourcesIfNeeded());
  },
  onSelectionChange(value) {
    dispatch(actions.selectDataSource(value));
    dispatch(actions.fetchDataSourceContent(value));
  },
});
//-------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(DataSourceSelector);

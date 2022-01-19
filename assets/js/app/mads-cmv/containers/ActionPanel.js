/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'ActionPanel' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'ActionPanel' is a part of the analysis page that provides us with possibilities that
//        allows us to edit and save the current workspace.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';

import ActionPanel from '../components/ActionPanel';
import * as actions from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => ({
  isLoggedIn: state.userInfo.isLoggedIn,
  workspaceInfo: state.workspaceInfo,
});
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available actions contained in this container
//-------------------------------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => ({
  onMount() {
    dispatch(actions.fetchUserInfoIfNeeded());
    dispatch(actions.fetchWorkspaceInfoIfNeeded());
  },
  onSave(name, overwrite, id) {
    dispatch(actions.saveWorkspace(name, overwrite, id));
  },
});
//-------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);

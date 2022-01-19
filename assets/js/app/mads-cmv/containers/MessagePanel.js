/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'MessagePanel' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'MessagePanel' is a part of the analysis page that provides us with possibilities that
//        allows us display messages to the user. (standalone windows)
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';

import MessagePanel from '../components/MessagePanel';
import * as actions from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => ({
  header: state.message.header,
  content: state.message.content,
  type: state.message.type,
  messageOpen: state.message.messageOpen,
});
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available actions contained in this container
//-------------------------------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => ({
  onDismiss() {
    dispatch(actions.setMessageOpen(false));
  },
});
//-------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(MessagePanel);

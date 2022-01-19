/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'ColorTags' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'ColorTags' is a part of the analysis page that provides us with possibilities that
//        allows us to give specific data a unique color in the various visualization views.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Lib, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ColorTags from '../components/ColorTags';
import * as Actions from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state) => ({
  colorTags: state.colorTags,
  selection: state.selection,
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

export default connect(mapStateToProps, mapDispatchToProps)(ColorTags);

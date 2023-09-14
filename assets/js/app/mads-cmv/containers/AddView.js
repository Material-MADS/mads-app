/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Redux Container for the 'AddViewButton' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'AddView' is a part of the analysis page that provides us with
//         possibilities that allows us to add new visualization component to the current
//         workspace.
// ------------------------------------------------------------------------------------------------
// References: React-Redux Libs, connected UI Component and Actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AddViewButton from '../components/AddViewButton';
import * as Actions from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available data contained in this container
//-------------------------------------------------------------------------------------------------
const mapStateToProps = (state) => ({});
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Available actions contained in this container
//-------------------------------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch),
});
//-------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(AddViewButton);

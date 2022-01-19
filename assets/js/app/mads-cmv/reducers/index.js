/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: These are all the available features/modules using redux reducers
// ------------------------------------------------------------------------------------------------
// Notes: 'index' exports all custom reducers features used by the Analysis page
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export all used/needed/required 'Analysis' Features/Modules
//-------------------------------------------------------------------------------------------------
export { default as dataSources } from './datasources';
export { default as dataset } from './dataset';
export { default as views } from './views';
export { default as selection } from './selection';
export { default as colorTags } from './colorTags';
export { default as userInfo } from './userInfo';
export { default as workspaceInfo } from './workspaceInfo';
export { default as message } from './message';
export { default as loading } from './loading';

export { reducer as form } from 'redux-form';

//-------------------------------------------------------------------------------------------------

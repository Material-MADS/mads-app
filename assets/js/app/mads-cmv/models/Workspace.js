/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the base model/class for the 'Workspace' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Workspace' let us save and load a set of views (visualization components) as a
//        group (workspace)
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// The exported base Class/Model
//-------------------------------------------------------------------------------------------------
export default class Workspace {
  constructor(initialState = {}) {
    this.name = initialState.name || '';
    this.accessibility = initialState.accessibility || 'pri';
    this.contents = initialState.contents || {};
  }
}
//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the base model/class for the 'View' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'View' let us look at the data in various ways via multiple visualization components
// ------------------------------------------------------------------------------------------------
// References: 3rd Party lib ShortId
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import * as ShortId from 'shortid';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The exported base Class/Model
//-------------------------------------------------------------------------------------------------
export default class View {
  constructor(initialState = {}) {
    this.id = initialState.id || ShortId.generate();
    this.name = initialState.name || '';
    this.type = initialState.type || '';
    this.rgl = initialState.rgl || {};
    this.rglRules = initialState.rglRules || {};
    this.component = initialState.component || new (class empty {})();
    this.settings = initialState.settings ? { ...initialState.settings } : {};
    this.properties = initialState.properties ? { ...initialState.properties } : {};
    this.filter = initialState.filter ? [...initialState.filter] : [];
    this.deps = initialState.deps || [];
  }
}
//-------------------------------------------------------------------------------------------------

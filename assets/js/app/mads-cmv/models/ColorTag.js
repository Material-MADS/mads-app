/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the base model/class for the 'Color Tag' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Color Tags' let us assign specific colors to our data as displayed in the components
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
export default class ColorTag {
  constructor(initialState = {}) {
    this.id = initialState.id || ShortId.generate();
    this.color = initialState.color || '';
    this.itemIndices = initialState.itemIndices
      ? [...initialState.itemIndices]
      : [];
  }
}
//-------------------------------------------------------------------------------------------------

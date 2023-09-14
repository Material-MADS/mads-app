/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Visual Component 'Factory' that calls for the creation of a VisComp
//              when a user selects Add View
// ------------------------------------------------------------------------------------------------
// Notes: 'Factory' gets a View Type and ID and then creates a new View of that type as found in
//        the ViewCatalog.
// ------------------------------------------------------------------------------------------------
// References: Internal 'View' & 'ViewCatalog'
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import View from '../../models/View';
import config from './ViewCatalog';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Create View
// Method that creates a instance of the 'View' Class and returns it
//-------------------------------------------------------------------------------------------------
const createView = (type, id, duplicateSettings) => {
  const viewSettings = {...(config.find((v) => v.type === type))};
  if (id) {
    viewSettings.id = id;
  }

  if (duplicateSettings) {
    viewSettings.settings = {...duplicateSettings}
  }
  const v = new View(viewSettings);
  return v;
};
//-------------------------------------------------------------------------------------------------

export default createView;

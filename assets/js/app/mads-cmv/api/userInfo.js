/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for the 'User Info' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'User Info' let us get information on the current user
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export feature/module methods
//-------------------------------------------------------------------------------------------------
export default function (getClient) {
  return {
    fetchUserInfo() {
      const client = getClient();
      const url = Urls['analysis:cuser']();

      return client.get(url);
    },
  };
}

//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for the 'Views' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Views' let us look at the data in various ways via multiple visualization components
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export feature/module methods
//-------------------------------------------------------------------------------------------------
export default function (getClient) {
  return {
    sendRequestViewUpdate(view, data) {
      const client = getClient();
      const url = Urls['analysis:analysis-view-update']();

      return client.post(url, {
        view,
        data,
      });
    },
  };
}
//-------------------------------------------------------------------------------------------------

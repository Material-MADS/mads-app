/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for the 'Data source' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Data source' let us load stored data
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export feature/module methods
//-------------------------------------------------------------------------------------------------
export default function (getClient) {
  return {
    fetchDataSourceList() {
      const url = Urls['datamanagement:datasource_rest_api']();

      const client = getClient();
      return client.get(url);
    },

    fetchDataSourceContent(id) {
      const url = Urls['datamanagement:datasource_content'](id);

      return fetch(url);
    },
  };
}
//-------------------------------------------------------------------------------------------------

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for the 'Prediction' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Prediction' let us create predictions based on previous ML runs in our components
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export feature/module methods
//-------------------------------------------------------------------------------------------------
export default function (getClient) {
  return {
    fetchOwnedModels() {
      const client = getClient();
      const url = Urls['prediction:models-api-owned']();

      return client.get(url);
    },

    createModel(data) {
      const client = getClient();
      const url = Urls['prediction:models-api-create-with-param']();

      return client.post(url, data);
    },

    updateModel(id, data) {
      const client = getClient();
      const url = Urls['prediction:models-api-update-with-param'](id);

      return client.post(url, data);
    },
  };
}
//-------------------------------------------------------------------------------------------------

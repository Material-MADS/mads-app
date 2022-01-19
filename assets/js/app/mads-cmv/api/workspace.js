/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for the 'Workspace' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Workspace' let us save and load a set of views (visualization components) as a
//        group (workspace)
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export feature/module methods
//-------------------------------------------------------------------------------------------------
export default function (getClient) {
  return {
    fetchWorkspaceInfo(id) {
      const client = getClient();
      const url = Urls['analysis:workspace-api-detail'](id);

      return client.get(url);
    },

    fetchOwnedWorkspace() {
      const client = getClient();
      const url = Urls['analysis:workspace-api-owned']();

      return client.get(url);
    },

    createWorkspace(data) {
      const client = getClient();
      const url = Urls['analysis:workspace-api-list']();

      return client.post(url, data);
    },

    updateWorkspace(id, data) {
      const client = getClient();
      const url = Urls['analysis:workspace-api-detail'](id);

      return client.patch(url, data);
    },
  };
}
//-------------------------------------------------------------------------------------------------

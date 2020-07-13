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

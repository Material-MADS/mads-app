export default function (getClient) {
  return {
    fetchDataSourceList() {
      const url = Urls['datamanagement:datasource_rest_api']();

      // return apiClient.get(url);
      const client = getClient();
      return client.get(url);
    },

    fetchDataSourceContent(id) {
      const url = Urls['datamanagement:datasource_content'](id);

      return fetch(url);
    },
  };
}

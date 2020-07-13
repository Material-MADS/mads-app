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
      // const url = Urls['prediction:models-api-detail'](id);
      const url = Urls['prediction:models-api-update-with-param'](id);

      return client.post(url, data);
    },
  };
}

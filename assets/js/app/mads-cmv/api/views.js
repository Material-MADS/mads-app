export default function (getClient) {
  return {
    sendRequestViewUpdate(view, data) {
      // console.log(view, data);
      const client = getClient();
      const url = Urls['analysis:analysis-view-update']();

      return client.post(url, {
        view,
        data,
      });
    },
  };
}

export default function (getClient) {
  return {
    fetchUserInfo() {
      // console.log(view, data);
      const client = getClient();
      const url = Urls['analysis:cuser']();

      return client.get(url);
    },
  };
}

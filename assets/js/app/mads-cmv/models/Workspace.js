export default class Workspace {
  constructor(initialState = {}) {
    // this.id = initialState.id || ShortId.generate();
    this.name = initialState.name || '';
    this.accessibility = initialState.accessibility || 'pri';
    this.contents = initialState.contents || {};
  }
}

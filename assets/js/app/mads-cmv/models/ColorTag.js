import * as ShortId from 'shortid';

export default class ColorTag {
  constructor(initialState = {}) {
    this.id = initialState.id || ShortId.generate();
    this.color = initialState.color || '';
    this.itemIndices = initialState.itemIndices
      ? [...initialState.itemIndices]
      : [];
  }
}

import * as ShortId from 'shortid';
import ScatterView from '../components/Views/Scatter';

export default class View {
  constructor(initialState = {}) {
    this.id = initialState.id || ShortId.generate();
    this.name = initialState.name || '';
    this.type = initialState.type || '';
    this.component = initialState.component || ScatterView;
    this.settings = initialState.settings ? { ...initialState.settings } : {};
    this.properties = initialState.properties
      ? { ...initialState.properties }
      : {};
    this.filter = initialState.filter ? [...initialState.filter] : [];
    this.deps = initialState.deps || [];
  }
}

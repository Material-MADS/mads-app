import View from '../../models/View';
import config from './ViewCatalog';

const createView = (type = 'scatter', id) => {
  const viewSettings = config.find((v) => v.type === type);

  if (id) {
    viewSettings.id = id;
  }

  const v = new View(viewSettings);
  return v;
};

export default createView;

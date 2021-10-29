import withCommandInterface from './ViewWrapper';
import ImageView from '../VisComponents/ImageView';
import ImageViewForm from './ImageViewForm';

import convertExtentValues from './FormUtils';


class ImageViewView extends withCommandInterface(ImageView, ImageViewForm) {

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    newValues["data"] = { data: newValues.imgData };

    newValues = convertExtentValues(newValues);
    updateView(id, newValues);
  };


  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }

    return data;
  };
}

export default ImageViewView;

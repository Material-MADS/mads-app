import withCommandInterface from './ViewWrapper';
import ParCoords from '../VisComponents/ParCoords';
import ParCoordsForm from './ParCoordsForm';

import convertExtentValues from './FormUtils';

export default class TableView extends withCommandInterface(
  ParCoords,
  ParCoordsForm
) {
  handleSubmit = (values) => {
    const { id, updateView, colorTags } = this.props;

    let newValues = { ...values };
    console.log(newValues);

    // filter out non-existing columns & colorTags
    const options = this.getColumnOptionArray();
    // window.v = values;
    const filteredColumns = values.axes.filter((c) => options.includes(c));
    newValues.axes = filteredColumns;

    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    newValues = convertExtentValues(newValues);

    updateView(id, newValues);
  };
}

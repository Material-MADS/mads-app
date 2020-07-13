import withCommandInterface from './ViewWrapper';
import Table from '../VisComponents/Table';
import TableForm from './TableForm';

import convertExtentValues from './FormUtils';

export default class TableView extends withCommandInterface(Table, TableForm) {
  handleSubmit = (values) => {
    const { id, updateView, colorTags } = this.props;

    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    const options = this.getColumnOptionArray();
    // window.v = values;
    const filteredColumns = values.columns.filter((c) => options.includes(c));
    newValues.columns = filteredColumns;

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

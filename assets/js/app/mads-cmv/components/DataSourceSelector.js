import React from 'react';
import PropTypes from 'prop-types';

import { Select } from 'semantic-ui-react';

class DataSourceSelector extends React.Component {
  static propTypes = {
    selectedDataSource: PropTypes.string,
    dataSources: PropTypes.arrayOf(PropTypes.any),
    onMount: PropTypes.func.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    selectedDataSource: '',
    dataSources: [],
  };

  UNSAFE_componentWillMount() {
    const { onMount } = this.props;
    onMount();
  }

  render() {
    const { selectedDataSource, dataSources, onSelectionChange } = this.props;

    const items = dataSources.map((dataSource) => ({
      key: dataSource.id,
      value: dataSource.id,
      text: dataSource.name,
    }));

    return (
      <Select
        className="item"
        selectOnNavigation={false}
        placeholder="Select data source..."
        search
        options={items}
        onChange={(_, item) => onSelectionChange(item.value)}
        value={selectedDataSource}
      />
    );
  }
}

export default DataSourceSelector;

/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the Custom 'Data Source Selector' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'DataSourceSelector' is a drop down list that allows us to select which of our available
//        data sources we wish to analyse in the current workspace.
// ------------------------------------------------------------------------------------------------
// References: React, prop-types & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'semantic-ui-react';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// The Component Class
//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------

export default DataSourceSelector;

import { connect } from 'react-redux';

import DataSourceSelector from '../components/DataSourceSelector';
import * as actions from '../actions/datasources';

const mapStateToProps = (state, ownProps) => ({
  dataSources: state.dataSources.items,
  selectedDataSource: state.dataSources.selectedDataSource,
});

const mapDispatchToProps = (dispatch) => ({
  onMount() {
    dispatch(actions.fetchDataSourcesIfNeeded());
  },
  onSelectionChange(value) {
    console.log(value);
    dispatch(actions.selectDataSource(value));

    dispatch(actions.fetchDataSourceContent(value));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSourceSelector);

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import App from '../App';
import * as Actions from '../actions';

const mapStateToProps = (state) => ({
  dataSources: state.dataSources.items,
  selectedDataSource: state.dataSources.selectedDataSource,
  views: state.views,
  dataset: state.dataset,
  isLoading: state.loading.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  actions: bindActionCreators(Actions, dispatch),
});

const MadsApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default MadsApp;

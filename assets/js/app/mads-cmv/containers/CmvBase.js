import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CmvBase from '../components/CmvBase';
import * as Actions from '../actions';

const mapStateToProps = (state) => ({
  dataSources: state.dataSources.items,
  selectedDataSource: state.dataSources.selectedDataSource,
  views: state.views,
  dataset: state.dataset,
  selection: state.selection,
  colorTags: state.colorTags,
  userInfo: state.userInfo,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  actions: bindActionCreators(Actions, dispatch),
});

// console.log(Actions);

export default connect(mapStateToProps, mapDispatchToProps)(CmvBase);

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ColorTags from '../components/ColorTags';
import * as Actions from '../actions';

const mapStateToProps = (state) => ({
  colorTags: state.colorTags,
  selection: state.selection,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  actions: bindActionCreators(Actions, dispatch),
});

// console.log(Actions);

export default connect(mapStateToProps, mapDispatchToProps)(ColorTags);

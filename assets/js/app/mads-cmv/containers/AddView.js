import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AddViewButton from '../components/AddViewButton';
import * as Actions from '../actions';

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch),
});

// console.log(Actions);

export default connect(mapStateToProps, mapDispatchToProps)(AddViewButton);

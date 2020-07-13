import { connect } from 'react-redux';

import MessagePanel from '../components/MessagePanel';
import * as actions from '../actions';

const mapStateToProps = (state, ownProps) => ({
  header: state.message.header,
  content: state.message.content,
  type: state.message.type,
  messageOpen: state.message.messageOpen,
  // isLoggedIn: state.userInfo.isLoggedIn,
  // workspaceInfo: state.workspaceInfo,
});

const mapDispatchToProps = (dispatch) => ({
  onDismiss() {
    dispatch(actions.setMessageOpen(false));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagePanel);

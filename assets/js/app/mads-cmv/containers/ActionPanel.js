import { connect } from 'react-redux';

import ActionPanel from '../components/ActionPanel';
import * as actions from '../actions';

const mapStateToProps = (state, ownProps) => ({
  isLoggedIn: state.userInfo.isLoggedIn,
  workspaceInfo: state.workspaceInfo,
});

const mapDispatchToProps = (dispatch) => ({
  onMount() {
    dispatch(actions.fetchUserInfoIfNeeded());
    dispatch(actions.fetchWorkspaceInfoIfNeeded());
  },
  onSave(name, overwrite, id) {
    dispatch(actions.saveWorkspace(name, overwrite, id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);

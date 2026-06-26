import React from 'react';
import Advisor from '../components/Advisor/Advisor';
import advisorApi from '../advisorApi';

class AdvisorStandalone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: advisorApi.isEnabled(),
      messages: [],
      isMinimized: false,
    };
    this._unsubscribe = null;
  }

  componentDidMount() {
    this._unsubscribe = advisorApi.onUpdate((state) => {
      this.setState({
        enabled: !!state.enabled,
        messages: state.messages || [],
        isMinimized: !!state.isMinimized,
      });
    });
  }

  componentWillUnmount() {
    if (this._unsubscribe) this._unsubscribe();
  }

  handleToggle = (isMinimized) => {
    advisorApi.setMinimized(isMinimized);
  }

  render() {
    const { enabled, messages, isMinimized } = this.state;
    return (
      <Advisor
        enabled={enabled}
        messages={messages}
        isMinimized={isMinimized}
        onToggleMinimize={this.handleToggle}
      />
    );
  }
}

export default AdvisorStandalone;

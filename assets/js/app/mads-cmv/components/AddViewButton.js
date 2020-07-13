import React from 'react';
import { Button, Dropdown, Header, Modal, Icon } from 'semantic-ui-react';

import PropTypes from 'prop-types';

import config from './Views/ViewCatalog';
import createView from './Views/factory';

const vizViews = config.filter((v) => v.category === 'Visualization');
const anaViews = config.filter((v) => v.category === 'Analysis');
const mlViews = config.filter((v) => v.category === 'Machine Learning');

const startId = 1;

function createNewId(existingViews) {
  const ids = existingViews.map((v) => v.id);
  let currentId = startId;

  let id = currentId.toString();
  while (ids.includes(id)) {
    currentId += 1;
    id = currentId.toString();
  }

  return id;
}

let key = 0;
const options = [];
if (vizViews.length > 0) {
  key += 1;
  options.push({ children: <i>Visualization</i>, disabled: true, key });
  const list = vizViews.map((v) => ({
    text: v.name,
    value: v.type,
    key: v.type,
  }));
  Array.prototype.push.apply(options, list);
}
if (anaViews.length > 0) {
  key += 1;
  options.push({ children: <i>Analysis</i>, disabled: true, key });
  const list = anaViews.map((v) => ({
    text: v.name,
    value: v.type,
    key: v.type,
  }));
  Array.prototype.push.apply(options, list);
}
if (mlViews.length > 0) {
  key += 1;
  options.push({ children: <i>Machine Learning</i>, disabled: true, key });
  const list = mlViews.map((v) => ({
    text: v.name,
    value: v.type,
    key: v.type,
  }));
  Array.prototype.push.apply(options, list);
}

class AddViewButton extends React.Component {
  state = { open: false, selected: null };

  constructor(props) {
    super(props);
    // this.state = { open: false, selected: null };

    this.open = () => this.setState({ open: true });
    this.close = () => this.setState({ open: false });

    this.onOk = this.onOk.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onOk() {
    this.close();

    const { selected } = this.state;
    const { actions, views } = this.props;

    // create new id
    const id = createNewId(views);
    const view = createView(selected, id);
    // console.log(view);
    actions.addView(view);
  }

  handleChange(e, data) {
    // console.log(data);
    this.setState({ selected: data.value });
  }

  render() {
    const { open, close } = this.state;

    return (
      <Modal
        trigger={
          <Button onClick={this.open}>
            <Icon name="add" />
            Add View
          </Button>
        }
        open={open}
        onClose={close}
      >
        <Header content="Select View" />
        <Modal.Content>
          <Dropdown
            fluid
            selection
            search
            placeholder="Select view..."
            options={options}
            onChange={this.handleChange}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.close} negative>
            Cancel
          </Button>
          <Button color="green" onClick={this.onOk}>
            Ok
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

AddViewButton.propTypes = {
  // addView: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    // createView: PropTypes.func.isRequired,
    addView: PropTypes.func.isRequired,
  }).isRequired,
};

export default AddViewButton;

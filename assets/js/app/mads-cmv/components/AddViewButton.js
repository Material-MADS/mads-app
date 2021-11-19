import React from 'react';
import { Button, Dropdown, Header, Modal, Icon } from 'semantic-ui-react';

import PropTypes from 'prop-types';

import config from './Views/ViewCatalog';
import createView from './Views/factory';

const uniqueCategories = [...new Set( config.map(v => v.category)) ];
const allAvaialableViews = Array(uniqueCategories.length);
for(var i = 0; i < allAvaialableViews.length; i++){
  allAvaialableViews[i] = config.filter((v) => v.category === uniqueCategories[i]);
}

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
for(let i = 0; i < uniqueCategories.length; i++){
  if (allAvaialableViews[i].length > 0) {
    key += 1;
    options.push({ children: <i>{uniqueCategories[i]}</i>, disabled: true, key });
    const list = allAvaialableViews[i].map((v) => ({
      text: v.name + ((v.devStage != undefined && v.devStage != "" && v.devStage != "Stable Release") ? " (** " + v.devStage + " **)" : "") + ((v.version != undefined && v.version != 1) ? " [v." + v.version + "]" : ""),
      value: v.type,
      key: v.type,
    }));
    Array.prototype.push.apply(options, list);
  }
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

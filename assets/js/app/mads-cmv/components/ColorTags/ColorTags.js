import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import * as gPalette from 'google-palette';

import ColorTag from '../../models/ColorTag';
import ColorTagView from './ColorTag';

import './style.css';

class ColorTags extends React.Component {
  static defaultProps = {
    colorTags: [],
    selection: [],
    actions: {},
  };

  static propTypes = {
    colorTags: PropTypes.arrayOf(PropTypes.any),
    selection: PropTypes.arrayOf(PropTypes.number),
  };

  index = 0;

  palette = gPalette('cb-Accent', 8).map((c) => `#${c}`);

  getNextIndex = () => {
    const i = this.index;
    this.index = this.index + 1;
    if (this.index > 7) {
      this.index = 0;
    }
    return i;
  };

  handleAddButtonClick = () => {
    const { selection, actions } = this.props;

    if (selection.length === 0) {
      return;
    }

    const colorTag = new ColorTag();
    colorTag.color = this.palette[this.getNextIndex()];
    colorTag.itemIndices = [...selection];

    actions.updateSelection([]);

    actions.addColorTag(colorTag);

    // console.log('ccc', colorTag);
    // console.log(actions);
  };

  render() {
    const { colorTags, actions } = this.props;

    const colorTagViews = colorTags.map((c) => (
      <ColorTagView
        key={c.id}
        id={c.id}
        color={c.color}
        removeColorTag={actions.removeColorTag}
        updateProperties={actions.updateColorTag}
      />
    ));

    // console.log(colorTagViews);

    return (
      <div className="tags-base-container">
        <Button onClick={() => this.handleAddButtonClick()}>
          Assign Color
        </Button>

        <div className="tag-container">{colorTagViews}</div>
      </div>
    );
  }
}

export default ColorTags;

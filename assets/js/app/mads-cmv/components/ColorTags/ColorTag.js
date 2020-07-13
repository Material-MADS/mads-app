import React, { useState } from 'react';
import { Button, Icon, SegmentInline } from 'semantic-ui-react';
import { ChromePicker } from 'react-color';
import reactCSS from 'reactcss';

const styleGen = (color) => ({
  backgroundColor: color,
});

const divStyle = {
  display: 'inline',
  marginRight: '3px',
};

class ColorTag extends React.Component {
  state = {
    displayColorPicker: false,
    color: this.props.color,
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
    const { id, updateProperties } = this.props;
    updateProperties(id, { color: this.state.color });
  };

  handleChange = (color) => {
    this.setState({ color: color.hex });
  };

  render() {
    const { id, color, removeColorTag } = this.props;

    const { color: sColor, displayColorPicker } = this.state;
    // console.log(sColor);

    const styles = reactCSS({
      default: {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <Button style={styleGen(sColor)}>
          <Icon name="delete" onClick={() => removeColorTag(id)} />
          <div style={divStyle}>{sColor}</div>
          <Icon name="configure" onClick={this.handleClick} />
        </Button>
        {displayColorPicker ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.handleClose} />
            <ChromePicker color={sColor} onChange={this.handleChange} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ColorTag;

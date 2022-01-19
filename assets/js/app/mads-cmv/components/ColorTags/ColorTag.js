/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Component for the 'ColorTag' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Color Tag' is the individual custom color component that is assigned to a specific
//        part of the data.
// ------------------------------------------------------------------------------------------------
// References: React, semantic-ui-react, react-color and reactCSS libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Button, Icon, SegmentInline } from 'semantic-ui-react';
import { ChromePicker } from 'react-color';
import reactCSS from 'reactcss';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Styling data
//-------------------------------------------------------------------------------------------------
const styleGen = (color) => ({
  backgroundColor: color,
});

const divStyle = {
  display: 'inline',
  marginRight: '10px',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Component Class
//-------------------------------------------------------------------------------------------------
export default class ColorTag extends React.Component {
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
//-------------------------------------------------------------------------------------------------

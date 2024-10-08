/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Redux Component for the 'CmvBase' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'CmvBase' is the main workspace area of the analysis page that provides us with
//        possibilities that allows us to add different views (visualization components) in order
//        to study the selected data.
// ------------------------------------------------------------------------------------------------
// References: React, prop-types Libs, ColorTags and AddView Containers,
//             and ViewCatalog (available vizualisation components)
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import ResizeObserver from 'rc-resize-observer';
import PropTypes from 'prop-types';

import ColorTags from '../../containers/ColorTags';
import AddViewButton from '../../containers/AddView';
import { Button } from 'semantic-ui-react';
import { config } from '../Views/ViewCatalog';

import { createNewId } from '../compUtils';
import createView from '../Views/factory';

import './style.css';

import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);


//-------------------------------------------------------------------------------------------------
// Component Global Variables
//-------------------------------------------------------------------------------------------------
let gridUnitWidth, gridUnitHeight = 100;
const border = { borderWidth: '1px', borderStyle: 'dashed'};
let sortNeedsUpdate;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Component Function
//-------------------------------------------------------------------------------------------------
export default function CmvBase({
    views,
    actions,
    dataset,
    selection,
    colorTags,
    userInfo,
    showMessage,
  }) {
  const [layout, setLayout] = useState([]);
  const [borderVisibility, setBorderVisibility] = useState(false);
  const [mobilityEnabling, setMobilityEnabling] = useState(false);

  const handleBVClick = (e) => {
    setBorderVisibility(!borderVisibility);
  }

  const tellWSSomething = (msg) => {
    if(msg.reloadWS){
      setMobilityEnabling(true);
      setTimeout(() => { setMobilityEnabling(false); }, 100);
    }
  }

  const handleMEClick = (e) => {
    if(mobilityEnabling){ sortNeedsUpdate = true; }
    setMobilityEnabling(!mobilityEnabling);
  }

  const layoutHasChanged = (newLayout) => {
    views.map((view) => {
        view.rgl = newLayout.find((e) => e.i == view.id)
    });
    setLayout(newLayout);
  }

  const duplicateView = (id, view) => {
    const index = views.findIndex(v => v.id ===id) + 1;
    const newSettings = {...view.settings, isDupli: true}
    const newId = createNewId(views);
    const newView = createView(view.type, newId, newSettings);
    actions.addView(newView, index);
  }

  const resizeWasDone = (newLayout, gridItemBeforeResize, gridItemAfterResize) => {
    const theActiveView = views.find((v) => v.id == gridItemAfterResize.i);
    const newSettings = {...theActiveView.settings, options: { ...theActiveView.settings.options, extent: {width: parseInt(gridItemAfterResize.w*gridUnitWidth-(gridUnitWidth/2)), height: parseInt(gridItemAfterResize.h*gridUnitHeight-(gridUnitHeight/2))}}};
    actions.updateView(gridItemAfterResize.i, newSettings);
    layoutHasChanged(newLayout);
  }

  const componentInnerSizeChanged = (eventValues, eventElement) => {
    const theLayoutItem = layout.find((e) => e.i == eventElement.parentElement.id);
    if(gridUnitWidth == undefined){ gridUnitWidth = parseInt(eventElement.parentElement.clientWidth / theLayoutItem.w) }

    let newGUSize = {w: 0, h: 0}
    for(var i = 1; i <= 30; i++){
        if(newGUSize.w == 0 && (gridUnitWidth * i) > eventValues.width){
          newGUSize.w = i;
        }
        if(newGUSize.h == 0 && (gridUnitHeight * i) > eventValues.height){
          newGUSize.h = i;
        }
        if(newGUSize.w > 0 && newGUSize.h > 0){
          break;
        }
    }

    if(newGUSize.w != theLayoutItem.w || newGUSize.h != theLayoutItem.h){
      const theLayoutIndex = layout.findIndex((e) => e.i == eventElement.parentElement.id);
      let newLayout = layout.map(item => ({ ...item }));
      newLayout[theLayoutIndex].w = newGUSize.w;
      newLayout[theLayoutIndex].h = newGUSize.h;
      layoutHasChanged(newLayout);
    }
  }

  if(sortNeedsUpdate == undefined && views.length > 0){ sortNeedsUpdate = false; views.sort((a, b) => a.rgl.y - b.rgl.y || a.rgl.x - b.rgl.x); }
  if(sortNeedsUpdate){ sortNeedsUpdate = false; views.sort((a, b) => a.rgl.y - b.rgl.y || a.rgl.x - b.rgl.x); }

  const viewContainers = views.map((view) => {
    const componentDef = config.find((c) => view.type === c.type);
    if(componentDef){
      const View = componentDef.component;

      const theRGL = (view.rgl !== undefined && view.rgl.x !== undefined) ? view.rgl : {x: 0, y: 0, w: 2, h: 2, };
      if(view.rglRules && view.rglRules.isResizable !== undefined){
        theRGL['isResizable'] = view.rglRules.isResizable
      }

      const getTheViewDom = () => (
        <View
          key={view.id}
          id={view.id}
          freeMobilityEnabled={mobilityEnabling}
          view={view}
          dataset={dataset}
          selection={selection}
          colorTags={colorTags}
          removeView={actions.removeViewData}
          defaultOptions={componentDef.settings.options}
          customButtons={componentDef.customBtns || []}
          duplicateView={duplicateView}
          updateView={actions.updateView}
          updateSelection={actions.updateSelection}
          actions={actions}
          isLoggedIn={userInfo.isLoggedIn}
          version={componentDef.version}
          devStage={componentDef.devStage}
          tellWSSomething={tellWSSomething}
          devInfo={componentDef.devInfo || []}
          superInfo={componentDef.supervisors || []}
          academicInfo={componentDef.academicInfo || []}
          description={componentDef.description || ""}
        />
      );

      return (
        <div
          id={view.id}
          style={{...border, borderColor: (borderVisibility ? 'gray' : 'transparent')}}
          key={view.id}
          data-grid={theRGL}
        >
          {mobilityEnabling ? (
            <ResizeObserver onResize={componentInnerSizeChanged}>
              { getTheViewDom() }
            </ResizeObserver>
          ) : getTheViewDom()
          }
        </div>
      );
    }
  });

  return (
    <div>
      <div className="base-container">
        <ColorTags />
        <Button toggle active={mobilityEnabling} onClick={handleMEClick} style={{marginTop: "5px", marginLeft: "0px", marginRight: "20px"}}>Enable Mobility</Button>
        {mobilityEnabling && <div style={{display: "inline"}}>
          <Button toggle active={borderVisibility} onClick={handleBVClick} style={{marginTop: "5px", marginLeft: "0px", marginRight: "20px"}}>Show Border</Button>
          <AddViewButton views={views} userInfo={userInfo} />
        </div>}
      </div>

      <div className="ui divider" />

      <div  className={(!mobilityEnabling ? 'base-container' : '')}>
        {mobilityEnabling ? (
          <ResponsiveGridLayout
            rowHeight={gridUnitHeight}
            className="layout"
            layouts={{lg: layout}}
            compactType={'horizontal'}
            style={{...border, borderColor: (borderVisibility ? 'blue' : 'transparent')}}
            // isResizable={true}
            onLayoutChange={layoutHasChanged}
            onResizeStop={resizeWasDone}
            draggableHandle= {".the-drag-handle"}
          >
            { viewContainers }
          </ResponsiveGridLayout>
        ) : viewContainers
        }
        {!mobilityEnabling && <AddViewButton views={views} userInfo={userInfo} />}
      </div>
    </div>
  );
}
//-------------------------------------------------------------------------------------------------

CmvBase.propTypes = {
  views: PropTypes.arrayOf(PropTypes.any),
  actions: PropTypes.objectOf(PropTypes.any),
  dataset: PropTypes.objectOf(PropTypes.any),
  selection: PropTypes.arrayOf(PropTypes.number),
  colorTags: PropTypes.arrayOf(PropTypes.any),
};

CmvBase.defaultProps = {
  views: [],
  actions: {},
  dataset: {},
  selection: [],
  colorTags: [],
};

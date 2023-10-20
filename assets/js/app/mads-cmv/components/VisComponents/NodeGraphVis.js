/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'NodeGraph' module
// ------------------------------------------------------------------------------------------------
// Notes: 'NodeGraph' is a network visualization component that displays an interactive node - link
//        graph.
// ------------------------------------------------------------------------------------------------
// References: React, redux & prop-types Libs, 3rd party jquery, lodash libs,
//             and also internal support methods from VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux'
import { Popup, Button } from 'semantic-ui-react';

import Viva from 'vivagraphjs';
import ngraphPath from 'ngraph.path';

import PropTypes from "prop-types";

import './NodeGraphVisStyles.css';

import $ from "jquery";

import noImg from './images/noimage.jpg';
import isSelectedImg from './images/isSelectedImg.png';

import { Turbo256 } from '@bokeh/bokehjs/build/js/lib/api/palettes';



//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "No-Data Simple Sample Node Graph",
  extent: { width: 700, height: 700 },
  bkgCol: "#ffffff",
  txtCol: "black",
  border: "1px solid black",
  // bkgGradientEnabled: false,
  // bkgGradientCols: ["white", "red", "orange", "yellow"],
};

const graphStyles = {
  nodeDefault: 10,
  nodeSelected: 20,
  selectedNodeColor: Viva.Graph.View._webglUtil.parseColor("#39FF14"),
  lineDefaultColor: Viva.Graph.View._webglUtil.parseColor("#999999")
};

let spMemData = [];
var spEdgeMem = [];
let selectedPath = {};
let domLabels = {};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// WebGL Shaders
//-------------------------------------------------------------------------------------------------

// *** Circle Node *************************************
function buildCircleNodeShader(customNodeAlpha, borderEnabled) {
  var ATTRIBUTES_PER_PRIMITIVE = 4,
      nodesFS = [`
        precision mediump float;
        varying vec4 color;

        void main(void) {
          float areaLocation = (gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5);
          if (areaLocation < 0.25) {
            if(bool(${borderEnabled}) == true){
              if (areaLocation > 0.10 && areaLocation < 0.20) { gl_FragColor = vec4(0., 0., 0., 1.); }
              else if (areaLocation > 0.20 && areaLocation < 0.22) { gl_FragColor = vec4(0., 0., 0., 0.7); }
              else if (areaLocation > 0.22 && areaLocation < 0.24) { gl_FragColor = vec4(0., 0., 0., 0.4); }
              else if (areaLocation > 0.24 && areaLocation < 0.25) { gl_FragColor = vec4(0., 0., 0., 0.2); }
              else { gl_FragColor = color;}
            }
            else{
              gl_FragColor = color;
            }
          } else {
            gl_FragColor = vec4(0);
          }
        }
      `].join('\n'),
      nodesVS = [`
        attribute vec2 a_vertexPos;
        attribute vec2 a_customAttributes;
        uniform vec2 u_screenSize;
        uniform mat4 u_transform;
        varying vec4 color;

        void main(void) {
          gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);
          gl_PointSize = a_customAttributes[1] * u_transform[0][0];
          float c = a_customAttributes[0];
          float alpha = float(${customNodeAlpha});
          c = floor(c/256.0);
          color.b = mod(c, 256.0); c = floor(c/256.0);
          color.g = mod(c, 256.0); c = floor(c/256.0);
          color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;
          color.a = alpha;
        }
      `].join('\n');

  var program,
      gl,
      buffer,
      locations,
      webglUtils,
      nodes = new Float32Array(64),
      nodesCount = 0,
      canvasWidth, canvasHeight, transform,
      isCanvasDirty;

  return {
    /** Called by webgl renderer to load the shader into gl context. **/
    load : function (glContext) {
      gl = glContext;
      webglUtils = Viva.Graph.webgl(glContext);

      program = webglUtils.createProgram(nodesVS, nodesFS);
      gl.useProgram(program);
      locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);

      gl.enableVertexAttribArray(locations.vertexPos);
      gl.enableVertexAttribArray(locations.customAttributes);

      buffer = gl.createBuffer();
    },

    /** Called by webgl renderer to update node position in the buffer array **/
    // @param nodeUI - data model for the rendered node (WebGLCircle in this case)
    // @param pos - {x, y} coordinates of the node.
    position : function (nodeUI, pos) {
      var idx = nodeUI.id;
      nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
      nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = -pos.y;
      nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
      nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = nodeUI.size;
    },

    /** Request from webgl renderer to actually draw our stuff into the gl context. This is the core of our shader. **/
    render : function() {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

      if (isCanvasDirty) {
        isCanvasDirty = false;
        gl.uniformMatrix4fv(locations.transform, false, transform);
        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
      }

      gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);

      gl.drawArrays(gl.POINTS, 0, nodesCount);
    },

    /** Called by webgl renderer when user scales/pans the canvas with nodes. **/
    updateTransform : function (newTransform) {
      transform = newTransform;
      isCanvasDirty = true;
    },

    /** Called by webgl renderer when user resizes the canvas with nodes. **/
    updateSize : function (newCanvasWidth, newCanvasHeight) {
      canvasWidth = newCanvasWidth;
      canvasHeight = newCanvasHeight;
      isCanvasDirty = true;
    },

    /** Called by webgl renderer to notify us that the new node was created in the graph **/
    createNode : function (node) {
      nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
      nodesCount += 1;
    },

    /** Called by webgl renderer to notify us that the node was removed from the graph **/
    removeNode : function (node) {
      if (nodesCount > 0) { nodesCount -=1; }

      if (node.id < nodesCount && nodesCount > 0) {
        webglUtils.copyArrayPart(nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
      }
    },

    /** This method is called by webgl renderer when it changes parts of its buffers. We don't use it here, but it's needed by API **/
    replaceProperties : function(replacedNode, newNode) {},
  };
}
// ******************************************************

// *** Bezier Curve Link *************************************
function buildBezierLinkShader() {
  var ATTRIBUTES_PER_PRIMITIVE = 6, // primitive is Line with two points. Each has x,y and color = 3 * 2 attributes.
      BYTES_PER_LINK = 2 * (2 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT), // two nodes * (x, y + color)
      linksFS = [
          'precision mediump float;',
          'varying vec4 color;',
          'void main(void) {',
          '   gl_FragColor = color;',
          '}'
      ].join('\n'),

      linksVS = [
          'attribute vec2 a_vertexPos;',
          'attribute vec4 a_color;',

          'uniform vec2 u_screenSize;',
          'uniform mat4 u_transform;',

          'varying vec4 color;',

          'void main(void) {',
          '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0.0, 1.0);',
          '   color = a_color.abgr;',
          '}'
      ].join('\n'),

      program,
      gl,
      buffer,
      utils,
      locations,
      linksCount = 0,
      frontLinkId, // used to track z-index of links.
      storage = new ArrayBuffer(16 * BYTES_PER_LINK),
      positions = new Float32Array(storage),
      colors = new Uint32Array(storage),
      width,
      height,
      transform,
      sizeDirty,

      ensureEnoughStorage = function () {
          if ((linksCount+1)*BYTES_PER_LINK > storage.byteLength) {
              var extendedStorage = new ArrayBuffer(storage.byteLength * 2),
                  extendedPositions = new Float32Array(extendedStorage),
                  extendedColors = new Uint32Array(extendedStorage);

              extendedColors.set(colors);
              positions = extendedPositions;
              colors = extendedColors;
              storage = extendedStorage;
          }
      };

  return {
    load : function (glContext) {
        gl = glContext;
        utils = Viva.Graph.webgl(glContext);

        program = utils.createProgram(linksVS, linksFS);
        gl.useProgram(program);
        locations = utils.getLocations(program, ['a_vertexPos', 'a_color', 'u_screenSize', 'u_transform']);

        gl.enableVertexAttribArray(locations.vertexPos);
        gl.enableVertexAttribArray(locations.color);

        buffer = gl.createBuffer();
    },

    position: function (linkUi, fromPos, toPos) {
        var linkIdx = linkUi.id,
            offset = linkIdx * ATTRIBUTES_PER_PRIMITIVE;
        positions[offset] = fromPos.x;
        positions[offset + 1] = fromPos.y;
        colors[offset + 2] = linkUi.color;

        positions[offset + 3] = toPos.x;
        positions[offset + 4] = toPos.y;
        colors[offset + 5] = linkUi.color;
    },

    createLink : function (ui) {
        ensureEnoughStorage();

        linksCount += 1;
        frontLinkId = ui.id;
    },

    removeLink : function (ui) {
        if (linksCount > 0) { linksCount -= 1; }
        if (ui.id < linksCount && linksCount > 0) {
          utils.copyArrayPart(colors, ui.id * ATTRIBUTES_PER_PRIMITIVE, linksCount * ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
        }
    },

    updateTransform : function (newTransform) {
      sizeDirty = true;
      transform = newTransform;
    },

    updateSize : function (w, h) {
      width = w;
      height = h;
      sizeDirty = true;
    },

    render : function () {
      gl.useProgram(program);
      function arc(positions, n, m) {
        for (var j = 0; j < positions.length; j++){
          if (positions[j] != positions[j+3] || positions[j+1] != positions[j+4]){
            var points = [];
            var pointsMid = [];
            var dx = positions[j] - positions[j+3],
                dy = positions[j+1] - positions[j+4],
                cx = (positions[j]+positions[j+3])/2,
                cy = (positions[j+1]+positions[j+4])/2,
                a = Math.atan2(dy, dx) * 180 / Math.PI,
                r = Math.sqrt(dx * dx + dy * dy)/2,
                angle = a * Math.PI / 180,
                dA = Math.PI / n;

            for (var i = 0; i <= n; i++) {
              var x = cx + r * Math.cos(angle + i * dA);
              var y = cy + r * Math.sin(angle + i * dA);
              pointsMid.push(x, y, 0.2);
            }
            if (n == 1){
              points = pointsMid;
            }else if (n == 2){
              for (var k = 0; k <= m; k++){
                var t = k / m;
                var Ax = ( (1 - t) * pointsMid[0] ) + (t * pointsMid[3]);
                var Ay = ( (1 - t) * pointsMid[1] ) + (t * pointsMid[4]);
                var Bx = ( (1 - t) * pointsMid[3] ) + (t * pointsMid[6]);
                var By = ( (1 - t) * pointsMid[4] ) + (t * pointsMid[7]);
                var x = ( (1 - t) * Ax ) + (t * Bx);
                var y = ( (1 - t) * Ay ) + (t * By);
                points.push(x, y, 0.2);
              }
            } else if (n == 3){
              for (var k = 0; k <= m; k++){
                var t = k / m;
                var Px0 = pointsMid[0];
                var Px1 = pointsMid[3];
                var Px2 = pointsMid[6];
                var Px3 = pointsMid[9];
                var Py0 = pointsMid[1];
                var Py1 = pointsMid[4];
                var Py2 = pointsMid[7];
                var Py3 = pointsMid[10];
                var x = Px0*(1-t)*(1-t)*(1-t) + 3*Px1*t*(1-t)*(1-t) + 3*Px2*t*t*(1-t) + Px3*t*t*t;
                var y = Py0*(1-t)*(1-t)*(1-t) + 3*Py1*t*(1-t)*(1-t) + 3*Py2*t*t*(1-t) + Py3*t*t*t;
                points.push(x, y, 0.2);
              }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);

            if (sizeDirty) {
                sizeDirty = false;
                gl.uniformMatrix4fv(locations.transform, false, transform);
                gl.uniform2f(locations.screenSize, width, height);
            }

            gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.vertexAttribPointer(locations.color, 4, gl.UNSIGNED_BYTE, true, 3 * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
            gl.drawArrays(gl.LINE_STRIP, 0, points.length/3)
          }
          j += 5;
        }
      }
      var d = 0; var j = 0;
      var ap = arc(positions, 2, 10);
    },

    bringToFront : function (link) {
      if (frontLinkId > link.id) {
        utils.swapArrayPart(positions, link.id * ATTRIBUTES_PER_PRIMITIVE, frontLinkId * ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
      }
      if (frontLinkId > 0) {
        frontLinkId -= 1;
      }
    },

    getFrontLinkId : function () {
      return frontLinkId;
    }
  };
};
// ******************************************************

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Model object for circle node ui in webgl
//-------------------------------------------------------------------------------------------------
function WebglCircle(size, color) {
  this.size = size;
  this.color = color;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Generate Labels for each Node and Link in the graph if requested
//-------------------------------------------------------------------------------------------------
const generateDOMLabels = function (graph, container, isLabelsEnabled, graphics) {
  var labels = Object.create(null);
  $(container).find('span').not("#networkTitle").remove();

  //NODES
  if(isLabelsEnabled && isLabelsEnabled.nodes){
    graph.forEachNode(function(node) {
      var label = document.createElement('span');
      label.classList.add('nodeLabel');
      label.innerText = node.id;
      labels[node.id] = label;
      container.appendChild(label);
    });

    graphics.placeNode(function(ui, pos) {
      var nodeSize = ui.size;
      var domPos = { x: pos.x - (nodeSize/4), y: pos.y - (nodeSize/2) };
      graphics.transformGraphToClientCoordinates(domPos);
      var nodeId = ui.node.id;
      var labelStyle = labels[nodeId].style;
      labelStyle.left = domPos.x + 'px';
      labelStyle.top = domPos.y + 'px';
    });
  }

  //LINKS
  if(isLabelsEnabled && isLabelsEnabled.links){
    var counter = 0;
    graph.forEachLink(function(link) {
      var label = document.createElement('span');
      label.classList.add('linkLabel');
      label.innerText = link.id;
      labels[link.id] = label;
      link.data = {idx: counter};
      container.appendChild(label);
      counter++;
    });

    var geom = Viva.Graph.geom();
    graphics.placeLink(function(linkUI, fromPos, toPos) {
      var toNodeSize, fromNodeSize;
      var linkId;
      graph.forEachLink(function(link) {
        if(linkUI.id == link.data.idx){
          linkId = link.id;
          toNodeSize = graphics.getNodeUI(link.toId).size;
          fromNodeSize = graphics.getNodeUI(link.fromId).size;
        };
      });

      var from = geom.intersectRect(fromPos.x-fromNodeSize/2, fromPos.y-fromNodeSize/2, fromPos.x+fromNodeSize/2, fromPos.y+fromNodeSize/2, fromPos.x, fromPos.y, toPos.x, toPos.y) || fromPos;
      var to = geom.intersectRect(toPos.x-toNodeSize/2, toPos.y-toNodeSize/2, toPos.x+toNodeSize/2, toPos.y+toNodeSize/2, toPos.x, toPos.y, fromPos.x, fromPos.y) || toPos;
      var domPos = { x: ((from.x + to.x) / 2) - 10, y: -((from.y + to.y) / 2) - 10 };
      graphics.transformGraphToClientCoordinates(domPos);

      var labelStyle = labels[linkId].style;
      labelStyle.left = domPos.x + 'px';
      labelStyle.top = domPos.y + 'px';
    });
  }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Generate Labels for each Node and Link in the graph if requested
//-------------------------------------------------------------------------------------------------
const generateDOMLabelsForShortestPath = function (graph, container, graphics, pathNodes) {
  var labels = Object.create(null);
  $(container).find('span').not("#networkTitle").remove();

  graph.forEachNode(function(node) {
    if (pathNodes.includes(node.id)) {
      var index = pathNodes.indexOf(node.id);
      var label = document.createElement('span');
      label.classList.add('nodeLabel');
      label.innerText = index+1;
      labels[node.id] = label;
      container.appendChild(label);
    }
  });

  graphics.placeNode(function(ui, pos) {
    if (pathNodes.includes(ui.node.id)) {
      var nodeSize = ui.size;
      var domPos = { x: pos.x - (nodeSize/4), y: pos.y - (nodeSize/2) };
      graphics.transformGraphToClientCoordinates(domPos);
      var nodeId = ui.node.id;
      var labelStyle = labels[nodeId].style;
      labelStyle.left = domPos.x + 'px';
      labelStyle.top = domPos.y + 'px';
    }
  });
}
//-------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// Reset Path Selection
// This will reset the selections of nodes and paths
//------------------------------------------------------------------------------------------------
const resetPathSelection = async (graphics, container, ngd) => {
  if(spEdgeMem.length !== 0){
    spEdgeMem.forEach((l) => {
      var linkUI = graphics.current.getLinkUI(l);
      if (linkUI) {
        linkUI.color = Viva.Graph.View._webglUtil.parseColor("#999999");
      }
    });
    spEdgeMem = [];
  }

  if(spMemData.length !== 0){
    spMemData.forEach((n) => {
      var nUI = graphics.current.getNodeUI(n[0]);
      nUI.color = n[1]
      nUI.size = n[2];
    });
    $(container).find('span').not("#networkTitle").remove();
    spMemData = [];
    domLabels = {};
  }

  if(selectedPath[ngd] != undefined && selectedPath[ngd].length == 2){
    selectedPath[ngd].forEach((n) => {
      var nUI = graphics.current.getNodeUI(n[0]);
      nUI.color = n[1]
      nUI.size = n[2];
    });
    selectedPath[ngd] = [];
  }
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// Get Shortest Path
// This will contact the server for calculating the shortest path between two nodes and return it
//------------------------------------------------------------------------------------------------
const getShortestPath = async (fromNodeId, toNodeId, graphics, graph, container, renderer) => {
  let pathFinder = ngraphPath.aStar(graph);
  let foundPath = pathFinder.find(fromNodeId, toNodeId);

  spEdgeMem = [];
  var indexLabelTxt = 1;
  foundPath.forEach((n, index) => {
    spMemData.push([n.id, n.data.color, n.data.size, index+1]);
    var nUI = graphics.getNodeUI(n.id);
    nUI.color = Viva.Graph.View._webglUtil.parseColor("#FF00FF");
    nUI.size = 20;

    var thisNode = graph.getNode(n.id);
    for (let i = 0; i < thisNode.links.length; i++) {
      for (let j = 0; j < foundPath.length; j++) {
        if((n.id == thisNode.links[i].fromId && foundPath[j].id == thisNode.links[i].toId) || (n.id == thisNode.links[i].toId && foundPath[j].id == thisNode.links[i].fromId)){
          var alreadyExist = false;
          for(let k = 0; k < spEdgeMem.length; k++){
            if(spEdgeMem[k] == thisNode.links[i].id){
              alreadyExist = true;
              break;
            }
          }
          if(!alreadyExist){
            spEdgeMem.push(thisNode.links[i].id);
          }
        }
      }
    }
  });
  spEdgeMem.forEach((l, index) => {
    var linkUI = graphics.getLinkUI(l);
    if (linkUI) {
      linkUI.color = Viva.Graph.View._webglUtil.parseColor("#ff00ff");
    }
  });

  generateDOMLabelsForShortestPath(graph, container, graphics, (foundPath.map(item => item.id)).reverse());
  renderer.rerender();
};
//------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function NodeGraph({
  data,
  options,
  colorTags,
  id,
  selectedIndices,
  onSelectedIndicesChange,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = {...data};
  const ngd = "graphDiv" + id;
  var dataResetRequest = false;
  var selectedNodes = [];

  const r = useRef();
  const g = useRef();
  const l = useRef();
  const gs = useRef();

  const [nodeInfoOpen, setNodeInfoOpen] = useState(false);
  const [nodeInfoContent, setNodeInfoContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [nodeLabelEnabled, setNodeLabelEnabled] = useState(false);
  const [linkLabelEnabled, setLinkLabelEnabled] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState({id: '', name: ''});
  const [selectedAttr, setSelectedAttr] = useState({size: 20, color: 0xffff00ff, src: isSelectedImg});

  const PopupNodeInfo = () => (
    <Popup id={'infoPopup'} context={rootNode} position={"top left"} offset={nodeInfoOffset} open={nodeInfoOpen} style={{zIndex: '100'}}>
      <div dangerouslySetInnerHTML={{__html: nodeInfoContent}} />
    </Popup>
  )

  const nodeInfoOffset = ({ placement, popper }) => {
    return [internalOptions.extent.width-popper.width-10, -(popper.height)-10];
  }

  const handleMouseEnter = (node) => {
    var linkNodesIdsStr = "";
    for(var i = 0; i < node.links.length; i++){
      if(node.links[i].fromId != node.id){ linkNodesIdsStr += '<li style="margin-left: 10px;">' + node.links[i].fromId + '</li>'; }
      if(node.links[i].toId != node.id){ linkNodesIdsStr += '<li style="margin-left: 10px;">' + node.links[i].toId + '</li>'; }
      if(i == 3 && node.links.length > 4){ linkNodesIdsStr += '<li style="margin-left: 10px;">...and ' + (node.links.length-4) + ' more</li>'; break; }
    }
    var cn = node.data.color;
    var hexColor = '#' + (cn >> 24 & 0xFF).toString(16).padStart(2, '0') + (cn >> 16 & 0xFF).toString(16).padStart(2, '0') + (cn >> 8 & 0xFF).toString(16).padStart(2, '0') + (cn & 0xFF).toString(16).padStart(2, '0');
    setNodeInfoContent(`
      <h4 style="font-family: Times New Roman; color: blue; font-weight: bold;">Node: ${node.id}</h4>
      <ul>
        <li>Color: <span style="width: 20px; height: 20px; background-color: ${hexColor}; color: ${hexColor};">___</span>${hexColor}</li>
        <li>Size: ${node.data.size}</li>
        <li>Number of Links: <span style="font-weight: bold;">${node.links.length}</span></li>
        ${linkNodesIdsStr}
      </ul>
    `);
    setNodeInfoOpen((prev) => true);
  };

  const handleMouseLeave = (node) => {
    setNodeInfoOpen((prev) => false);
  };

  const handleNodeSnglClick = (node, e) => {
    if(e.ctrlKey && e.altKey){
      e.preventDefault();
      const cntnr = $(rootNode.current).find('#'+ngd)[0];

      resetPathSelection(gs, cntnr, ngd);
      resetSelection();

      var nodeUI = gs.current.getNodeUI(node.id);
      var thisNode = [node.id, nodeUI.color, nodeUI.size];
      selectedPath[ngd].push(thisNode);
      nodeUI.color = graphStyles.selectedNodeColor
      nodeUI.size = 15;

      if(selectedPath[ngd].length == 2){
        getShortestPath(selectedPath[ngd][0][0], selectedPath[ngd][1][0], gs.current, g.current, cntnr, r.current);
      }
    }
    else if(e.ctrlKey){
      resetSelection();
      selectedNodes.push(node.id);
      var nodeUI = gs.current.getNodeUI(node.id);
      nodeUI.color = selectedAttr.color;
      for(var i = 0; i < nodeUI.node.links.length; i++){
        var relatedNodeId = nodeUI.node.links[i].fromId != node.id ? nodeUI.node.links[i].fromId : nodeUI.node.links[i].toId
        selectedNodes.push(relatedNodeId);
        var relNodeUI = gs.current.getNodeUI(relatedNodeId);
        relNodeUI.color = 0xffbb00ff;
      }
    }
  };

  const handleNodeDblClick = (node, e) => {
    if(e.altKey){
      var uri = 'https://www.google.com/search?q=' + node.id;
      window.open(uri, '_blank');
    }
  };

  const resetSelection = function(){
    for(var i = 0; i < selectedNodes.length; i++){
      var nodeUI = gs.current.getNodeUI(selectedNodes[i]);
      nodeUI.color = nodeUI.node.data.color;
    }
    selectedNodes = [];
    r.current.rerender();
  };

  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    if(availableDataSources.selectedDataSource != currentDataSource.id){
      if(currentDataSource.id != ''){
        dataResetRequest = true;
        if(g.current){ g.current.clear(); };
        setTimeout(function(){ delete internalData.linkList; createChart(); dataResetRequest = false; }, 1000);
      }
      setCurrentDataSource({id: availableDataSources.selectedDataSource, name: ((availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name)});
    }
  } catch (error) { /*Just ignore and move on*/ }

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    $(rootNode.current).append(`
      <div id="${ngd}" style="position:relative; width: ${internalOptions.extent.width}px; height: ${internalOptions.extent.height}px; border: ${internalOptions.border}; background-color: ${internalOptions.bkgCol}; color: ${internalOptions.txtCol}; overflow: hidden;">
        <span id="networkTitle" style="position: absolute; font-weight: bold; font-family: Times New Roman; margin-left: 2px; margin-top: 2px; background-color: transparent;">${internalOptions.title}</span>
        <div class="graph-overlay"></div>
      </div>
      <div name='instCont' style='width: ` + (parseInt(internalOptions.extent.width)-20) + `px; text-align: left; margin-top: -2px; line-height: 1.0; cursor: pointer;'>
        <span name='molViewInstrHdr' style='font-size: 14px; font-weight: bold;'>
          Click to show Full Instructions:</br>
        </span>
        <span name='instr' style='font-size: 10px; font-weight: normal; display: none;'>
          Node click while holding CTRL-key selects clicked node and directly related nodes. Unselect by clicking while holding the ALT-key
          <br>Hold SHIFT-key while click drag the mouse to select multiple nodes. Unselect multi-select by doing the same outside the graph.
          <br>To find the shortest path between two nodes, click them, one after the other, while at the same time holding CTRL-key + ALT-key.
          <br>Hold ALT-key while double-clicking on node to find out more about it.
        </span>
      </div>
    `);

    // --- VIVA GRAPH JS ---
    var graphics = Viva.Graph.View.webglGraphics();
    var graph = Viva.Graph.graph();
    var layoutObj = {
      springLength : 100, // Ideal length for links (springs in physical model)
      springCoeff : 0.0005, //Hook's law coefficient. 1 - solid spring.
      dragCoeff : 0.02, //Drag force coefficient. Used to slow down system, thus should be less than 1. The closer it is to 0 the less tight system will be.
      gravity : -5.2, //Coulomb's law coefficient. It's used to repel nodes thus should be negative if you make it positive nodes start attract each other
      theta: 0.8, //Theta coefficient from Barnes Hut simulation. Ranged between (0, 1). The closer it's to 1 the more nodes algorithm will have to go through. Setting it to one makes Barnes Hut simulation no different from brute-force forces calculation (each node is considered).
      timeStep : 20, //Default time step (dt) for forces integration
    };
    var imgNode; //Only used if images for nodes are enabled

    if(internalData.linkList){
      setTimeout(function(){ $(rootNode.current).find('#networkTitle').html("Node Graph for '" + currentDataSource.name + "' data"); }, 1000);

      // Setting Layout  (including Link lengths and interaction forces)
      //---------------------------------------
      layoutObj = {
        springLength : internalOptions.links.baseLength,
        springCoeff : internalOptions.graphLayout.springCoeff,
        dragCoeff : internalOptions.graphLayout.dragCoeff,
        gravity : internalOptions.graphLayout.gravity,
        theta: internalOptions.graphLayout.theta,
        timeStep : internalOptions.graphLayout.timeStep,
      };

      if(!isNaN(internalData.linkList[0].lw)){
        var maxWeight = Math.max(...(internalData.linkList).map(item => item.lw)) + internalOptions.links.minLength;
        layoutObj["springTransform"] = function (link, spring) {
          spring.length = maxWeight - link.data.lw;
          //spring.coeff = ???;
        }
      }

      // Creating Node and Links based on Data
      //---------------------------------------
      for(var i = 0, link; link = internalData.linkList[i]; i++){
        graph.addLink(link.sn, link.tn, { lw: link.lw });
      }
    }
    else{
      console.log("No data found");

      var graphGenerator = Viva.Graph.generator();
      graph = graphGenerator.grid(3, 3);
    }

    // Finalize and draw the graph
    var layout = Viva.Graph.Layout.forceDirected(graph, layoutObj);

    // Alter Node size and color based on settings
    //--------------------------------------------------------------
    var colour = internalOptions.nodes && internalOptions.nodes.staticColor ? internalOptions.nodes.staticColor : '#00a1ee';
    var size = internalOptions.nodes && internalOptions.nodes.staticSize ? internalOptions.nodes.staticSize : 15;
    var opacity = internalOptions.nodes && internalOptions.nodes.opacity ? internalOptions.nodes.opacity : 1.0;
    colour = parseInt(colour.toString().replace('#', '') + Math.floor(opacity * 255).toString(16), 16);
    var calculator, degree, maxWeight, colStep, sizeStep, bezierLink, circleNode, imgNode;
    if(internalOptions.nodes && (internalOptions.nodes.colorGradeEnabled || internalOptions.nodes.sizeGradeEnabled) && dataResetRequest == false && internalData.linkList){
      calculator = Viva.Graph.centrality(); //(also available: betweenness, closeness, eccentricity)
      degree = calculator.degreeCentrality(graph);
      maxWeight = Math.max(...degree.map(item => item.value));
      colStep = 256/maxWeight;
      sizeStep = 100/maxWeight;
    }

    // Node as Circle (instead of square)
    if(internalOptions.nodes && internalOptions.nodes.shapeType == "Circle"){
      circleNode = buildCircleNodeShader((internalOptions.nodes.roundShapeOpacity ? internalOptions.nodes.roundShapeOpacity : 1.0), (internalOptions.nodes.roundShapeBorderEnabled ? internalOptions.nodes.roundShapeBorderEnabled : false));
      graphics.setNodeProgram(circleNode);
    }

    // Node as Img (instead of square or circle)
    if(internalOptions.nodes && internalOptions.nodes.shapeType == "Image"){
       imgNode = Viva.Graph.View.webglImageNodeProgram();
      graphics.setNodeProgram(imgNode);
    }

    graphics.node(function(node){
      if(degree != undefined){
        const theNode = degree.find(n => n.key === node.id);
        if(internalOptions.nodes.colorGradeEnabled){
          const nodeColorIndex = Math.floor(parseInt(theNode.value) * colStep)-1;
          colour = Turbo256[nodeColorIndex];
        }
        if(internalOptions.nodes.sizeGradeEnabled){
          size = Math.floor(parseInt(theNode.value) * sizeStep)-1;
          if(size < 5){ size = 5; }
        }
      }

      if(internalOptions.nodes && internalOptions.nodes.shapeType == "Circle"){
        return new WebglCircle(size, colour);
      }
      else if(internalOptions.nodes && internalOptions.nodes.shapeType == "Image"){
        return new Viva.Graph.View.webglImage(size, (internalOptions.nodes.imgShapeImgURL ? internalOptions.nodes.imgShapeImgURL : noImg));
      }
      else{
        return Viva.Graph.View.webglSquare(size, colour);
      }
    })
    //-------------------------------------------------------------

    // Alter Link color and curvation
    //---------------------------------------
    if(internalOptions.links && internalOptions.links.bezierCurveEnabled){
      bezierLink = buildBezierLinkShader();
      graphics.setLinkProgram(bezierLink);
    }

    graphics.link(function(link) {
      var color = (internalOptions.links && internalOptions.links.staticColor ? internalOptions.links.staticColor : '#000000');
      var l_opacity = (internalOptions.links && internalOptions.links.opacity ? internalOptions.links.opacity : 0.7);
      color = parseInt(color.replace('#', '') + Math.floor(l_opacity * 255).toString(16), 16);
      return Viva.Graph.View.webglLine(color);
    });
    //---------------------------------------

    var renderer = Viva.Graph.View.renderer(graph, {
       layout : layout,
       container: $(rootNode.current).find('#'+ngd)[0],
       graphics : graphics,
    });

    renderer.run();

    // Store graphic data in the node for memory purpose
    graph.forEachNode((n) => {
      var nodeUI = graphics.getNodeUI(n.id);
      n.data = {size: nodeUI.size, color: nodeUI.color, src: nodeUI.src};
    });

    // store graph elements internally for future use
    r.current = renderer;
    g.current = graph;
    l.current = layout;
    gs.current = graphics;

    selectedPath[ngd] = [];

    // Create Event handlers
    const events = Viva.Graph.webglInputEvents(graphics, graph);
    events.mouseEnter(handleMouseEnter);
    events.mouseLeave(handleMouseLeave);
    events.click(handleNodeSnglClick);
    // events.mouseMove(handleMouseMove);
    events.dblClick(handleNodeDblClick);

    const componentBackground = $(rootNode.current).parent().find("#"+ngd);
    componentBackground.off('click');
    componentBackground.on( "click", function (e) {
      if(e.altKey && !e.ctrlKey){
        resetPathSelection(gs, $(rootNode.current).find('#'+ngd)[0], ngd);
        resetSelection();
      }
    });

    const viewWrapperCustomButton_ToggleNodeResettling = $(rootNode.current).parent().parent().find('#toggleNodeResettling' + id);
    viewWrapperCustomButton_ToggleNodeResettling.off('click');
    viewWrapperCustomButton_ToggleNodeResettling.on( "click", function () { setPinned((pinned) => !pinned); });
    setPinned(false);

    const viewWrapperCustomButton_ToggleNodeLabels = $(rootNode.current).parent().parent().find('#toggleNodeLabels' + id);
    viewWrapperCustomButton_ToggleNodeLabels.off('click');
    viewWrapperCustomButton_ToggleNodeLabels.on( "click", function () { setNodeLabelEnabled((nodeLabelEnabled) => !nodeLabelEnabled); });
    setNodeLabelEnabled(false);

    const viewWrapperCustomButton_ToggleLinkLabels = $(rootNode.current).parent().parent().find('#toggleLinkLabels' + id);
    viewWrapperCustomButton_ToggleLinkLabels.off('click');
    viewWrapperCustomButton_ToggleLinkLabels.on( "click", function () { setLinkLabelEnabled((linkLabelEnabled) => !linkLabelEnabled); });
    setLinkLabelEnabled(false);


    const toggleInstructions = $(rootNode.current).parent().parent().find("[name='instCont']");
    toggleInstructions.off('click');
    toggleInstructions.on( "click", function () {
      var inst = $(rootNode.current).parent().parent().find("[name='instr']");
      if(inst.is(":visible")){ $(rootNode.current).parent().parent().find("[name='instr']").hide(); }
      else{ $(rootNode.current).parent().parent().find("[name='instr']").show(); }
    });

    var multiSelectOverlay;
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Shift' && !multiSelectOverlay) { // shift key
        multiSelectOverlay = startMultiSelect(graph, renderer, layout);
      }
    });
    document.addEventListener('keyup', function(e) {
      if (e.key === 'Shift' && multiSelectOverlay) {
        multiSelectOverlay.destroy();
        multiSelectOverlay = null;
      }
    });

    // Multi Select Nodes
    //--------------------------------
    function startMultiSelect(graph, renderer, layout) {
      var graphics = renderer.getGraphics();
      var domOverlay = document.querySelector('.graph-overlay');
      var overlay = createOverlay(domOverlay);
      const truePos = $(rootNode.current).find('#'+ngd).offset();
      overlay.onAreaSelected(handleAreaSelected);

      return overlay;

      function handleAreaSelected(area) {
        area = {...area, x: area.x - truePos.left, y: area.y - truePos.top}
        // For the sake of this demo we are using silly O(n) implementation.
        // Could be improved with spatial indexing if required.
        var topLeft = graphics.transformClientToGraphCoordinates({
          x: area.x,
          y: area.y
        });

        var bottomRight = graphics.transformClientToGraphCoordinates({
          x: area.x + area.width,
          y: area.y + area.height
        });

        graph.forEachNode(higlightIfInside);
        renderer.rerender();
        // setTimeout(function(){renderer.rerender();}, 100);

        return;

        function higlightIfInside(node) {
          var nodeUI = graphics.getNodeUI(node.id);
          if (isInside(node.id, topLeft, bottomRight)) {
            nodeUI.color = selectedAttr.color;
            nodeUI.size = selectedAttr.size;
            if(nodeUI.src != undefined){ nodeUI.src = selectedAttr.src; }
          } else {
            nodeUI.color = node.data.color;
            nodeUI.size = node.data.size;
            nodeUI.src = node.data.src;
          }
          if(nodeUI.src != undefined){
            // imgNode.createNode(nodeUI);
            if(nodeUI.size == selectedAttr.size){
              nodeUI.size = node.data.size * 1.5;
            }
          }
        }

        function isInside(nodeId, topLeft, bottomRight) {
          var nodePos = layout.getNodePosition(nodeId);
          return (topLeft.x < nodePos.x && nodePos.x < bottomRight.x &&
            topLeft.y < nodePos.y && nodePos.y < bottomRight.y);
        }
      }
    }

    function createOverlay(overlayDom) {
      var selectionClasName = 'graph-selection-indicator';
      var selectionIndicator = overlayDom.querySelector('.' + selectionClasName);
      if (!selectionIndicator) {
        selectionIndicator = document.createElement('div');
        selectionIndicator.className = selectionClasName;
        overlayDom.appendChild(selectionIndicator);
      }

      var notify = [];
      var dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
      var selectedArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
      var startX = 0;
      var startY = 0;

      dragndrop.onStart(function(e) {
        startX = selectedArea.x = e.clientX;
        startY = selectedArea.y = e.clientY;
        selectedArea.width = selectedArea.height = 0;

        updateSelectedAreaIndicator();
        selectionIndicator.style.display = 'block';
      });

      dragndrop.onDrag(function(e) {
        recalculateSelectedArea(e);
        updateSelectedAreaIndicator();
        notifyAreaSelected();
      });

      dragndrop.onStop(function() {
        selectionIndicator.style.display = 'none';
      });

      overlayDom.style.display = 'block';

      return {
        onAreaSelected: function(cb) {
          notify.push(cb);
        },
        destroy: function () {
          overlayDom.style.display = 'none';
          dragndrop.release();
        }
      };

      function notifyAreaSelected() {
        notify.forEach(function(cb) {
          cb(selectedArea);
        });
      }

      function recalculateSelectedArea(e) {
        selectedArea.width = Math.abs(e.clientX - startX);
        selectedArea.height = Math.abs(e.clientY - startY);
        selectedArea.x = Math.min(e.clientX, startX);
        selectedArea.y = Math.min(e.clientY, startY);
      }

      function updateSelectedAreaIndicator() {
        const truePos = $(rootNode.current).find('#'+ngd).offset();
        selectionIndicator.style.left = (selectedArea.x - truePos.left) + 'px';
        selectionIndicator.style.top = (selectedArea.y - truePos.top) + 'px';
        selectionIndicator.style.width = selectedArea.width + 'px';
        selectionIndicator.style.height = selectedArea.height + 'px';
      }
    }
    //--------------------------------
  };

  // Clear away the VizComp
  const clearChart = () => { /* Called when component is deleted */ };

  // attach an exit strategy
  useEffect(() => {
    return () => { clearChart(); };
  }, [])

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [data, options, colorTags]);

  // Event handler for the toggle pinned/stable nodes button
  useEffect(() => {
    const viewWrapperCustomButton_ToggleNodeResettling = $(rootNode.current).parent().parent().find('#toggleNodeResettling' + id);
    if(pinned){
      viewWrapperCustomButton_ToggleNodeResettling.css("color", "green");
    }
    else{
      viewWrapperCustomButton_ToggleNodeResettling.css("color", "red");
    }
    if(g && g.current){
      g.current.forEachNode((n) => {
        l.current.pinNode(n, pinned);
      });
    }
  }, [pinned]);

  // Event handler for the toggle Node Label button
  useEffect(() => {
    const viewWrapperCustomButton_ToggleNodeLabels = $(rootNode.current).parent().parent().find('#toggleNodeLabels' + id);
    if(nodeLabelEnabled){
      viewWrapperCustomButton_ToggleNodeLabels.css("color", "green");
    }
    else{
      viewWrapperCustomButton_ToggleNodeLabels.css("color", "red");
    }
    if(g && g.current){
      generateDOMLabels(g.current, $(rootNode.current).find('#'+ngd)[0], {nodes: nodeLabelEnabled, links: linkLabelEnabled}, gs.current );
      r.current.rerender();
    }
  }, [nodeLabelEnabled]);

  // Event handler for the toggle Link Label button
  useEffect(() => {
    const viewWrapperCustomButton_ToggleLinkLabels = $(rootNode.current).parent().parent().find('#toggleLinkLabels' + id);
    if(linkLabelEnabled){
      viewWrapperCustomButton_ToggleLinkLabels.css("color", "green");
    }
    else{
      viewWrapperCustomButton_ToggleLinkLabels.css("color", "red");
    }
    if(g && g.current){
      generateDOMLabels(g.current, $(rootNode.current).find('#'+ngd)[0], {nodes: nodeLabelEnabled, links: linkLabelEnabled}, gs.current );
      r.current.rerender();
    }
  }, [linkLabelEnabled]);

  // Add the VizComp to the DOM
  return (
    <div>
      <PopupNodeInfo />
      <div
        ref={rootNode}
      />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
NodeGraph.propTypes = {
  data: PropTypes.shape({
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
    bkgCol: PropTypes.string,
    txtCol: PropTypes.string,
    border: PropTypes.string,
  //   bkgGradientEnabled: PropTypes.bool,
  //   bkgGradientCols: PropTypes.arrayOf(PropTypes.string),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
NodeGraph.defaultProps = {
  data: {},
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------

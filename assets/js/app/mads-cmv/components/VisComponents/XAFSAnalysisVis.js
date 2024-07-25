/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2024
// ________________________________________________________________________________________________
// Authors:Miyasaka Naotoshi [2024-] 
//         Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'XAFSAnalysis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'XAFSAnalysis' is a visualization component that displays a classic XAFSAnalysis in
//        various ways based on a range of available properties, and is rendered with the help of the
//        Plotly library.
// ------------------------------------------------------------------------------------------------
// References: React, redux & prop-types Libs, 3rd party lodash, jquery and Plotly libs with
//             Bokeh color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button, Confirm, Form, Modal, Icon, Slider } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import _ from 'lodash';
import $ from "jquery";
import Plotly from 'plotly.js-dist-min';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

import * as d3 from "d3";

import * as loadingActions from '../../actions/loading';

import api from '../../api';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------

const defaultOptions = {
  title: "XAFSAnalysis",
  extent: { width: 450, height: 450 },
  margin: { top: 56, right: 51, bottom: 55, left: 51},
  marker: {
    size: 4,
    color: 'blue',
    opacity: 0.8,
  },
};

const defaultData = {
  'X': [0, 1], // Initial X data
  'Y': [0, 1], // Initial Y data
};

//-------------------------------------------------------------------------------------------------
// Get Chart Data / Scatter Plot Part
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------


export default function XAFSAnalysis({
  data,
  options,
  actions,
  selectedIndices,
}) {
  const rootNode = useRef(null);
  const statsNode = useRef(null);
  const triangleNode = useRef(null);
  const internalOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [minPoint, setMinPoint] = useState(19); // Default minPoint value is the 20th data
  const [new_data, setNewData] = useState([]); 
  const [XANES_data, setChartData] = useState(defaultData);
  const [selectedButton, setSelectedButton] = useState("Raw Data");
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  const [currentServerInfo, setServerInfo] = useState("No Info");
  const [retres, setRetres] = useState(null);
  const [stats, setStats] = useState(null);
  const [oxide, setOxide] = useState('');
  const [valence_group, setValenceGroup] = useState('');
  const [valence_each, setValenceEach] = useState('');
  const containerRef = useRef(null);
  const initialWidth = useRef(internalOptions.extent.width);
  const [lastSelections, setLastSelections] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [indices, setIndices] = useState([]);
  const zoomRef = useRef(null);
  const currentTransformRef = useRef(d3.zoomIdentity);

  const handleSelectedIndicesChange = useCallback(() => {
    const { onSelectedIndicesChange } = actions;
    const newIndices = selectedIndices
    .map(i => ({
      x: new_data[i]?.x,
      y: new_data[i]?.y
    }))
    .filter(d => d.x !== undefined && d.y !== undefined);
  
    if (selecting) {
      return;
    }
  
    if (onSelectedIndicesChange && !deepEqual(lastSelections, newIndices)) {
      setSelecting(true);
      setLastSelections([...newIndices]);
      onSelectedIndicesChange(newIndices);
      setSelecting(false);
    }
  
    setIndices(newIndices);
  
  }, [actions, selecting, lastSelections, selectedIndices]);
  
  useEffect(() => {
    handleSelectedIndicesChange();
  }, [handleSelectedIndicesChange]);
 
  useEffect(() => {
    if (!rootNode.current) return;

    let new_data = [];
    let XANES_data = [];
    let EXAFS_data = [];
    let newDataWithHighlightedPoint = [];

    // else part is occured when initial
    if (data && data['Raw_Energy'] && data['Raw_Abs'] && data['Raw_Energy'].length === data['Raw_Abs'].length) {
      new_data = data['Raw_Energy'].map((x, i) => ({ x, y: data['Raw_Abs'][i] }));

      if (data['XANES_Data'] && data['XANES_Data']['XANES_x'] && data['XANES_Data']['XANES_y'] &&
          data['XANES_Data']['XANES_x'].length === data['XANES_Data']['XANES_y'].length) {
        XANES_data = data['XANES_Data']['XANES_x'].map((x, i) => ({ x, y: data['XANES_Data']['XANES_y'][i] }));
      } else {
        XANES_data = []; // Or set to default XANES data if available
      }
    
      if (data['EXAFS_Data'] && data['EXAFS_Data']['EXAFS_x'] && data['EXAFS_Data']['EXAFS_y'] &&
          data['EXAFS_Data']['EXAFS_x'].length === data['EXAFS_Data']['EXAFS_y'].length) {
        EXAFS_data = data['EXAFS_Data']['EXAFS_x'].map((x, i) => ({ x, y: data['EXAFS_Data']['EXAFS_y'][i] }));
      } else {
        EXAFS_data = []; // Or set to default EXAFS data if available
      }
    } else {
      new_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
      XANES_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
      EXAFS_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
    }

    setChartData(XANES_data);
    setNewData(new_data);

    // Clears existing svg elements (deletes previous scatterplot)
    d3.select(rootNode.current).selectAll("*").remove();

    const width = internalOptions.extent.width - internalOptions.margin.left - internalOptions.margin.right;
    const height = internalOptions.extent.height - internalOptions.margin.top - internalOptions.margin.bottom;

    const svg = d3.select(rootNode.current)
      .attr("width", internalOptions.extent.width)
      .attr("height", internalOptions.extent.height)
      .style("background-color", "transparent")
      .append("g")
      .attr("transform", `translate(${internalOptions.margin.left},${internalOptions.margin.top})`);

    // Default is to use new_data scale
    let xExtent = d3.extent(new_data, d => d.x);
    let yExtent = d3.extent(new_data, d => d.y);
    let xExtent2 = d3.extent(new_data, d => d.x);
    let yExtent2 = d3.extent(new_data, d => d.y);

    // For each data, use its scale
    if (selectedButton === "XANES") {
      xExtent = d3.extent(XANES_data, d => d.x);
      yExtent = d3.extent(XANES_data, d => d.y);
      xExtent2 = d3.extent(XANES_data, d => d.x);
      yExtent2 = d3.extent(XANES_data, d => d.y);
    }
    if (selectedButton === "EXAFS") {
      xExtent = d3.extent(EXAFS_data, d => d.x);
      yExtent = d3.extent(EXAFS_data, d => d.y);
      xExtent2 = d3.extent(EXAFS_data, d => d.x);
      yExtent2 = d3.extent(EXAFS_data, d => d.y);
    }

    if (selectedButton === "Raw Data & XANES") {
      xExtent2 = d3.extent(XANES_data, d => d.x);
      yExtent2 = d3.extent(XANES_data, d => d.y);
    }

    if (selectedButton === "XANES & EXAFS") {
      xExtent = d3.extent(XANES_data, d => d.x);
      yExtent = d3.extent(XANES_data, d => d.y);
      xExtent2 = d3.extent(EXAFS_data, d => d.x);
      yExtent2 = d3.extent(EXAFS_data, d => d.y);
    }

    if (selectedButton === "EXAFS & Raw Data") {
      xExtent = d3.extent(EXAFS_data, d => d.x);
      yExtent = d3.extent(EXAFS_data, d => d.y);
    }

    // xScale and yScale for the main plot
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);

    // xScale2 and yScale2 for the secondary axes
    const xScale2 = d3.scaleLinear()
      .domain(xExtent2)
      .range([0, width]);

    const yScale2 = d3.scaleLinear()
      .domain(yExtent2)
      .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxis2 = d3.axisTop(xScale2);
    const yAxis2 = d3.axisRight(yScale2);

    const gX = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("transform", "rotate(-45)") // Rotate text 45 degrees
      .style("text-anchor", "end"); // Set text anchor to end position

    const gY = svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "12px");

    const gX2 = svg.append("g")
      .attr("class", "x-axis-2")
      .call(xAxis2)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("transform", "rotate(-45)") // Rotate text 45 degrees
      .style("text-anchor", "start"); // Set text anchor to start position

    const gY2 = svg.append("g")
      .attr("class", "y-axis-2")
      .attr("transform", `translate(${width},0)`)
      .call(yAxis2)
      .selectAll("text") 
      .style("font-size", "12px"); 

    const gridX = svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line.horizontal-grid-line")
      .data(yScale.ticks())
      .enter().append("line")
      .attr("class", "horizontal-grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "lightgray")
      .attr("stroke-dasharray", "2,0");

    const gridY = svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line.vertical-grid-line")
      .data(xScale.ticks())
      .enter().append("line")
      .attr("class", "vertical-grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "lightgray")
      .attr("stroke-dasharray", "2,0");

///// If gridX2 or gridY2 is needed, uncomment it/////////

    // const gridX2 = svg.append("g")
      // .attr("class", "grid-lines")
      // .selectAll("line.horizontal-grid-line")
      // .data(yScale2.ticks())
      // .enter().append("line")
      // .attr("class", "horizontal-grid-line")
      // .attr("x1", 0)
      // .attr("x2", width)
      // .attr("y1", d => yScale2(d))
      // .attr("y2", d => yScale2(d))
      // .attr("stroke", "whitesmoke")
      // .attr("stroke-dasharray", "2,2");

    // const gridY2 = svg.append("g")
      // .attr("class", "grid-lines")
      // .selectAll("line.vertical-grid-line")
      // .data(xScale2.ticks())
      // .enter().append("line")
      // .attr("class", "vertical-grid-line")
      // .attr("x1", d => xScale2(d))
      // .attr("x2", d => xScale2(d))
      // .attr("y1", 0)
      // .attr("y2", height)
      // .attr("stroke", "whitesmoke")
      // .attr("stroke-dasharray", "2,2");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const transform = event.transform;
        currentTransformRef.current = transform;
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);
        const newXScale2 = transform.rescaleX(xScale2);
        const newYScale2 = transform.rescaleY(yScale2);

        const yGridLines = svg.selectAll('.horizontal-grid-line')
        .data(newYScale.ticks());

        yGridLines.enter()
          .append('line')
          .attr('class', 'horizontal-grid-line')
          .merge(yGridLines)
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", d => newYScale(d))
          .attr("y2", d => newYScale(d))
          .attr('clip-path', 'url(#clip)')
          .attr("stroke", "lightgray")
          .attr("stroke-dasharray", "2,0")
          .lower();

        yGridLines.exit().remove();


        const xGridLines = svg.selectAll('.vertical-grid-line')
          .data(newXScale.ticks());

        xGridLines.enter()
          .append('line')
          .attr('class', 'vertical-grid-line')
          .merge(xGridLines)
          .attr("x1", d => newXScale(d))
          .attr("x2", d => newXScale(d))
          .attr("y1", 0)
          .attr("y2", height)
          .attr('clip-path', 'url(#clip)')
          .attr("stroke", "lightgray")
          .attr("stroke-dasharray", "2,0")
          .lower();

        xGridLines.exit().remove();

        svg.selectAll('.dot, .dot-xanes, .dot-exafs, .highlighted-dot, .highlighted-dot1')
          .attr('cx', d => newXScale(d.x))
          .attr('cy', d => newYScale(d.y))
          .style("pointer-events", "none");
        
        svg.selectAll('.dot2, .dot2-xanes, .dot2-exafs, .highlighted-dot2, .highlighted-dot12')
          .attr('cx', d => newXScale2(d.x))
          .attr('cy', d => newYScale2(d.y))
          .style("pointer-events", "none");

        svg.select('.x-axis')
          .call(d3.axisBottom(newXScale));
        
        svg.select('.y-axis')
          .call(d3.axisLeft(newYScale));

        svg.select('.x-axis-2')
          .call(d3.axisTop(newXScale2));

        svg.select('.y-axis-2')
          .call(d3.axisRight(newYScale2));

        svg.selectAll('.x-axis text')
          .style("font-size", "12px")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");
      
        svg.selectAll('.x-axis-2 text')
          .style("font-size", "12px")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "start");

        svg.selectAll('.y-axis text')
          .style("font-size", "12px");
      
        svg.selectAll('.y-axis-2 text')
          .style("font-size", "12px");

      });
    
    zoomRef.current = zoom; 
    //  Add a background rectangle to be the target of the zoom operation
    svg.append("rect")
       .attr("width", width)
       .attr("height", height)
       .style("fill", "none")
       .style("pointer-events", "all")
       .call(zoom);
    
    // Define a clipping path
    svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width + 8)
    .attr("height", height + 8)
    .attr("x", -8/2)  // Extend to the left
    .attr("y", -8/2); // Extend upward

    // Set x-axis label and y-axis label text according to selected buttons
    let xAxisLabelTop = "";
    let xAxisLabelBottom = "";
    let yAxisLabelLeft = "";
    let yAxisLabelRight = "";

    switch(selectedButton) {
      case "Raw Data":
        xAxisLabelTop = "";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Abs.";
        yAxisLabelRight = "";
        svg.selectAll(".dot")
        .data(new_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
          });
          if (isDefaultData) return 'none';

          // Highlight selected indices(Correspondence between table and XAFS Analysis)
          const isSelected = indices.some(index => index.x === d.x && index.y === d.y);
          return isSelected ? 'red' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "XANES":
        xAxisLabelTop = "";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Norm. Abs.";
        yAxisLabelRight = "";
        svg.selectAll(".dot-xanes")
        .data(XANES_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-xanes")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Indicate minPoint with a pink dot
        svg.selectAll('.highlighted-dot')
        .data(XANES_data.filter((d, i) => {
          if (i === minPoint && !((d.x === defaultData.X[0] && d.y === defaultData.Y[0])|(d.x === defaultData.X[1] && d.y === defaultData.Y[1]))) {
            return true; 
          }
          return false; 
        }))
        .enter().append('circle')
        .attr('class', 'highlighted-dot')
        .attr('clip-path', 'url(#clip)')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', '#FF1493')
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Correspondence between statistics and blinking red dots
        svg.selectAll('.highlighted-dot1')
        .data(XANES_data.filter(d => {
          if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
            return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]);
          }
          return false; 
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') 
          .attr("fill-opacity", internalOptions.marker.opacity);
         break;

      case "EXAFS":
        xAxisLabelTop = "";
        xAxisLabelBottom = "R / Å";
        yAxisLabelLeft = "RDF";
        yAxisLabelRight = "";
        svg.selectAll(".dot-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-exafs")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Correspondence between statistics and blinking red dots
        svg.selectAll('.highlighted-dot1')
        .data(EXAFS_data.filter(d => {
          if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
            return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]); 
          }
          return false;
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') 
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "Raw Data & XANES":
        xAxisLabelTop = "";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Abs.";
        yAxisLabelRight = "Norm. Abs.";
        svg.selectAll(".dot")
        .data(new_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
          });
          if (isDefaultData) return 'none';

          // Highlight selected indices(Correspondence between table and XAFS Analysis)
          const isSelected = indices.some(index => index.x === d.x && index.y === d.y);
          return isSelected ? 'red' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);
        
        svg.selectAll(".dot2-xanes")
        .data(XANES_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot2-xanes")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Indicate minPoint with a pink dot
        svg.selectAll('.highlighted-dot2')
        .data(XANES_data.filter((d, i) => {
          if (i === minPoint && !((d.x === defaultData.X[0] && d.y === defaultData.Y[0])|(d.x === defaultData.X[1] && d.y === defaultData.Y[1]))) {
            return true; 
          }
          return false; 
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot2')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', '#FF1493')
          .attr("fill-opacity", internalOptions.marker.opacity);

          // Correspondence between statistics and blinking red dots
        svg.selectAll('.highlighted-dot12')
        .data(XANES_data.filter(d => {
          if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
            return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]); 
          }
          return false;
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot12 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', 'red')
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "EXAFS & Raw Data":
        xAxisLabelTop = "Energy / eV";
        xAxisLabelBottom = "R / Å";
        yAxisLabelLeft = "RDF";
        yAxisLabelRight = "Abs.";
        svg.selectAll(".dot-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-exafs")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);
        
        svg.selectAll(".dot2")
        .data(new_data)
        .enter().append("circle")
        .attr("class", "dot2")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
          });
          if (isDefaultData) return 'none';

          // Highlight selected indices(Correspondence between table and XAFS Analysis)
          const isSelected = indices.some(index => index.x === d.x && index.y === d.y);
          return isSelected ? 'red' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Correspondence between statistics and blinking red dots
        svg.selectAll('.highlighted-dot1')
        .data(EXAFS_data.filter(d => {
          if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
            return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]);
          }
          return false;
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red')
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "XANES & EXAFS":
        xAxisLabelTop = "R / Å";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Norm. Abs.";
        yAxisLabelRight = "RDF";
        svg.selectAll(".dot-xanes")
        .data(XANES_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-xanes")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        svg.selectAll(".dot2-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot2-exafs")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // Indicate minPoint with a pink dot
        svg.selectAll('.highlighted-dot')
        .data(XANES_data.filter((d, i) => {
          if (i === minPoint && !((d.x === defaultData.X[0] && d.y === defaultData.Y[0])|(d.x === defaultData.X[1] && d.y === defaultData.Y[1]))) {
            return true; 
          }
          return false;
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', '#FF1493') 
          .attr("fill-opacity", internalOptions.marker.opacity);

          // Correspondence between statistics and blinking red dots
        svg.selectAll('.highlighted-dot1')
        .data(XANES_data.filter(d => {
          if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
            return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]); 
          }
          return false; 
        }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') 
          .attr("fill-opacity", internalOptions.marker.opacity);

          // Correspondence between statistics and blinking red dots
          svg.selectAll('.highlighted-dot12')
          .data(EXAFS_data.filter(d => {
            if (highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y) {
              return !(d.x === defaultData.X[0] && d.y === defaultData.Y[0]);
            }
            return false; 
          }))
        .enter().append('circle')
          .attr('class', 'highlighted-dot12 blinking')
          .attr('clip-path', 'url(#clip)')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', 'red') 
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      default:
        xAxisLabelTop = "";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Abs.";
        yAxisLabelRight = "";
        svg.selectAll(".dot")
        .data(new_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr('clip-path', 'url(#clip)')
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
          });
          if (isDefaultData) return 'none';

          // Highlight selected indices(Correspondence between table and XAFS Analysis)
          const isSelected = indices.some(index => index.x === d.x && index.y === d.y);
          return isSelected ? 'red' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);
    }

    // Update x-axis labels (top)
    svg.selectAll(".x-axis-label-top").remove();
    svg.append("text")
      .attr("class", "x-axis-label-top")
      .attr("x", width / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("font-size", "13.9px")
      .attr("fill", "black")
      .text(xAxisLabelTop);

    // Update x-axis labels (below)
    svg.selectAll(".x-axis-label-bottom").remove();
    svg.append("text")
      .attr("class", "x-axis-label-bottom")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "13.9px")
      .attr("fill", "black")
      .text(xAxisLabelBottom);

    // Update y-axis labels (left)
    svg.selectAll(".y-axis-label-left").remove();
    svg.append("text")
      .attr("class", "y-axis-label-left")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "13.9px")
      .attr("fill", "black")
      .text(yAxisLabelLeft);

    // Update y-axis labels (right)
    svg.selectAll(".y-axis-label-right").remove();
    svg.append("text")
      .attr("class", "y-axis-label-right")
      .attr("transform", "rotate(90)")
      .attr("x", height / 2)
      .attr("y", -width - 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "13.9px")
      .attr("fill", "black")
      .text(yAxisLabelRight);

     // Apply the current transform on initial render
    requestAnimationFrame(() => {
      const transform = currentTransformRef.current;
      if (transform) {
        svg.call(zoomRef.current.transform, transform);
      }
    });

//-------------------------------------------------------------------------------------------------
// Statistics Part
//-------------------------------------------------------------------------------------------------
    const XANES_statistics = {
      XANES_statistics_Maxx: data.XANES_statistics_Maxx || 0,
      XANES_statistics_Maxy: data.XANES_statistics_Maxy || 0,
      XANES_statistics_E0x: data.XANES_statistics_E0x || 0,
      XANES_statistics_E0y: data.XANES_statistics_E0y || 0,
      XANES_statistics_Minx: data.XANES_statistics_Minx || 0,
      XANES_statistics_Miny: data.XANES_statistics_Miny || 0
    };

    const EXAFS_statistics = {
      EXAFS_statistics_x: data.EXAFS_statistics_x || 0,
      EXAFS_statistics_y: data.EXAFS_statistics_y || 0
    };

    const stats = computeStatistics(new_data, XANES_statistics, EXAFS_statistics);
    renderTable(stats);

  }, [data, internalOptions, selectedButton, minPoint, highlightedPoint, rootNode, indices]); 

  const computeStatistics = (new_data, XANES_statistics, EXAFS_statistics) => {
    if (!new_data || new_data.length === 0){
      return{
        XA_Maxx: 0,
        XA_Maxy: 0,
        XA_E0x: 0,
        XA_E0y: 0,
        XA_Minx: 0,
        XA_Miny: 0,
        EX_Maxyxposition: 0,
        EX_Maxy: 0,
      };
    }

    return {
      XA_Maxx: XANES_statistics.XANES_statistics_Maxx,
      XA_Maxy: XANES_statistics.XANES_statistics_Maxy,
      XA_E0x: XANES_statistics.XANES_statistics_E0x,
      XA_E0y: XANES_statistics.XANES_statistics_E0y,
      XA_Minx: XANES_statistics.XANES_statistics_Minx,
      XA_Miny: XANES_statistics.XANES_statistics_Miny,
      EX_Maxyxposition: EXAFS_statistics.EXAFS_statistics_x,
      EX_Maxy: EXAFS_statistics.EXAFS_statistics_y,
    };
  };

  const tableBorderStyle = {
    border: "1px solid black",
    padding: "10px",
    borderRadius: "5px",
  };

  // Define blinking animation with CSS
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes blink {
      0% { fill-opacity: 1; }
      50% { fill-opacity: 0; }
      100% { fill-opacity: 1; }
    }

    .blinking {
      animation: blink 1s infinite;
    }
  `;
  document.head.appendChild(style);

  const handleMouseEnter = (point) => {
    setHighlightedPoint(point);
  };

  const handleMouseLeave = () => {
    setHighlightedPoint(null);
  };

  const renderTable = (stats) => {
    const formatNumber = (number) => {
      return number.toFixed(2); // Format to 2 decimal places
    };

    const table = (
      <div style={tableBorderStyle}>
        <table>
          <tbody>
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.XA_Maxx, y: stats.XA_Maxy })} onMouseLeave={handleMouseLeave}>
              <td>XA_MaxPoint:</td>
              <td>({formatNumber(stats.XA_Maxx)}, {formatNumber(stats.XA_Maxy)})</td>
            </tr>
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.XA_E0x, y: stats.XA_E0y })} onMouseLeave={handleMouseLeave}>
              <td>XA_E0Point:</td>
              <td>({formatNumber(stats.XA_E0x)}, {formatNumber(stats.XA_E0y)})</td>
            </tr>
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.XA_Minx, y: stats.XA_Miny })} onMouseLeave={handleMouseLeave}>
              <td>XA_MinPoint:</td>
              <td>({formatNumber(stats.XA_Minx)}, {formatNumber(stats.XA_Miny)})</td>
            </tr>
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.EX_Maxyxposition, y: stats.EX_Maxy })} onMouseLeave={handleMouseLeave}>
              <td>EX_Maxyxposition:</td>
              <td>{formatNumber(stats.EX_Maxyxposition)} Å</td>
            </tr>           
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.EX_Maxyxposition, y: stats.EX_Maxy })} onMouseLeave={handleMouseLeave}>
              <td>EX_Maxy:</td>
              <td>{formatNumber(stats.EX_Maxy)}</td>
            </tr>                   
          </tbody>
        </table>
      </div>
    )

    if (statsNode.current){
      ReactDOM.render(table, statsNode.current);
    }
  };

  // Calculate statistics when retres are updated and re-render table
  useEffect(() => {
    if (retres) {
      const XANES_statistics = {
        XANES_statistics_Maxx: retres.XANES_statistics_Maxx || 0,
        XANES_statistics_Maxy: retres.XANES_statistics_Maxy || 0,
        XANES_statistics_E0x: retres.XANES_statistics_E0x || 0,
        XANES_statistics_E0y: retres.XANES_statistics_E0y || 0,
        XANES_statistics_Minx: retres.XANES_statistics_Minx || 0,
        XANES_statistics_Miny: retres.XANES_statistics_Miny || 0
      };

      const EXAFS_statistics = {
        EXAFS_statistics_x: retres.EXAFS_statistics_x || 0,
        EXAFS_statistics_y: retres.EXAFS_statistics_y || 0
      };

      const newStats = computeStatistics(retres, XANES_statistics, EXAFS_statistics);
      setStats(newStats);
    }
  }, [retres, minPoint, selectedButton, highlightedPoint]);

//-------------------------------------------------------------------------------------------------
// Oxide and Valence Show Part (Output)
//-------------------------------------------------------------------------------------------------
  const getOxideText = (predictOxide) => {
    if (predictOxide === 0) {
      return 'This is "Non-Oxide"';
    } else if (predictOxide === 1) {
      return 'This is "Oxide"';
    } else {
      return '';
    }
  };
  
  const getValenceGroupText = (predictValenceGroup) => {
    if (predictValenceGroup === 0) {
      return 'Valence (Group) 0 ';
    } else if (predictValenceGroup === "1 - 3") {
      return 'Valence (Group) 1-3 ';
    } else if (predictValenceGroup === "4 - 6") {
      return 'Valence (Group) 4-6 ';
    } else {
      return '';
    }
  };
  
  const getValenceEachText = (predictValenceEach) => {
    switch (predictValenceEach) {
      case 0:
        return '& (Each) 0';
      case 1:
        return '& (Each) 1';
      case 2:
        return '& (Each) 2';
      case 3:
        return '& (Each) 3';
      case 4:
        return '& (Each) 4';
      case 5:
        return '& (Each) 5';
      case 6:
        return '& (Each) 6';
      default:
        return '';
    }
  };
  
  useEffect(() => {
    if (data) {
      let oxide = getOxideText(data.Predict_Oxide);
      let valence_group = getValenceGroupText(data.Predict_Valence_Group);
      let valence_each = getValenceEachText(data.Predict_Valence_Each);
  
      setOxide(oxide);
      setValenceGroup(valence_group);
      setValenceEach(valence_each);
    } 
  }, [data]);
  
  useEffect(() => {
    if (retres) {
      let oxide = getOxideText(retres.Predict_Oxide);
      let valence_group = getValenceGroupText(retres.Predict_Valence_Group);
      let valence_each = getValenceEachText(retres.Predict_Valence_Each);
  
      setOxide(oxide);
      setValenceGroup(valence_group);
      setValenceEach(valence_each);
    }
  }, [retres, minPoint, selectedButton, highlightedPoint]);
  
  // Calculate statistics when stats are updated and re-render table
  useEffect(() => {
    if (stats) {
      renderTable(stats);
    }
  }, [stats]);

//-------------------------------------------------------------------------------------------------
// Triangle Button Part
//-------------------------------------------------------------------------------------------------
  useEffect(() => {
    d3.select(triangleNode.current).selectAll("*").remove();
    const triangleVertices = [
      { x: 75, y: 200 },
      { x: 125, y: 100 },
      { x: 175, y: 200 }
    ];

    const triangle_svg = d3.select(triangleNode.current)
      .attr("width", initialWidth.current * 2 / 3)
      .attr("height", internalOptions.extent.height)
      .append("g")
      .attr("transform", `translate(${initialWidth.current*2 / 6 - 125}, ${internalOptions.extent.height / 2 - 150})`);

    triangle_svg.append("line")
      .attr("x1", triangleVertices[0].x)
      .attr("y1", triangleVertices[0].y)
      .attr("x2", triangleVertices[1].x)
      .attr("y2", triangleVertices[1].y)
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("id", "Raw Data & XANES")
      .on("click", () => {
      });

    triangle_svg.append("line")
      .attr("x1", triangleVertices[1].x)
      .attr("y1", triangleVertices[1].y)
      .attr("x2", triangleVertices[2].x)
      .attr("y2", triangleVertices[2].y)
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("id", "EXAFS & Raw Data")
      .on("click", () => {
      });

    triangle_svg.append("line")
      .attr("x1", triangleVertices[2].x)
      .attr("y1", triangleVertices[2].y)
      .attr("x2", triangleVertices[0].x)
      .attr("y2", triangleVertices[0].y)
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("id", "XANES & EXAFS")
      .on("click", () => {
      });

    triangle_svg.append("circle")
       .attr("cx", 75)
       .attr("cy", 200)
       .attr("r", 15)
       .attr("fill", "black")
       .attr("id", "XANES")
       .on("click", () => {
       });

    triangle_svg.append("circle")
       .attr("cx", 125)
       .attr("cy", 100)
       .attr("r", 15)
       .attr("fill", "black")
       .attr("id", "Raw Data")
       .on("click", () => {
       });
       
    triangle_svg.append("circle")
       .attr("cx", 175)
       .attr("cy", 200)
       .attr("r", 15)
       .attr("fill", "black")
       .attr("id", "EXAFS")
       .on("click", () => {
       });

    triangle_svg.append("text")
       .attr("x", 75)
       .attr("y", 230)
       .text("XANES")
       .attr("fontsize", "20px")
       .attr("text-anchor", 'middle')
       .attr("fill", "black");

    triangle_svg.append("text")
       .attr("x", 175)
       .attr("y", 230)
       .text("EXAFS")
       .attr("fontsize", "20px")
       .attr("text-anchor", 'middle')
       .attr("fill", "black");

    triangle_svg.append("text")
       .attr("x", 125)
       .attr("y", 80)
       .text("Raw Data")
       .attr("fontsize", "20px")
       .attr("text-anchor", 'middle')
       .attr("fill", "black");

    triangle_svg.selectAll("line")
      .on("click", function() {
        d3.select(triangleNode.current).selectAll("line").attr("stroke", "black");
        d3.select(triangleNode.current).selectAll("circle").attr("fill", "black");
        d3.select(this).attr("stroke", "red");
        const buttonName = d3.select(this).attr("id");
        setSelectedButton(buttonName);

        // Reset zoom transformation
        const svg = d3.select(rootNode.current);
        svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    });

    triangle_svg.selectAll("circle")
      .on("click", function() {
        d3.select(triangleNode.current).selectAll("circle").attr("fill", "black");
        d3.select(triangleNode.current).selectAll("line").attr("stroke", "black");
        d3.select(this).attr("fill", "red");
        const buttonName = d3.select(this).attr("id");
        setSelectedButton(buttonName);

         // Reset zoom transformation
        const svg = d3.select(rootNode.current);
        svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    });

  }, [internalOptions, selectedButton]); 

  useEffect(() => {
    if ((selectedButton === "" || selectedButton === "Raw Data") && data && data['XANES_Data'] && data['XANES_Data']['XANES_x'] !== null) {
      d3.select(triangleNode.current).select(`#Raw\\ Data`).attr("fill", "red");
      setSelectedButton("Raw Data");
    } else if (selectedButton === "XANES") {
      d3.select(triangleNode.current).select(`#XANES`).attr("fill", "red");
    } else if (selectedButton === "EXAFS") {
      d3.select(triangleNode.current).select(`#EXAFS`).attr("fill", "red");
    } else if (selectedButton === "Raw Data & XANES") {
      d3.select(triangleNode.current).select(`#Raw\\ Data\\ \\&\\ XANES`).attr("stroke", "red");
    } else if (selectedButton === "EXAFS & Raw Data") {
      d3.select(triangleNode.current).select("#EXAFS\\ \\&\\ Raw\\ Data").attr("stroke", "red");
    } else if (selectedButton === "XANES & EXAFS") {
      d3.select(triangleNode.current).select("#XANES\\ \\&\\ EXAFS").attr("stroke", "red");
    }
  }, [data, internalOptions, selectedButton]);
  
//-------------------------------------------------------------------------------------------------
// Recalculate Button Part
//-------------------------------------------------------------------------------------------------
  const handleRecalculate = async (data) => {
    if (!oxide) {
      console.log("Oxide is empty. Cannot recalculate.");
      return false;
    }
    if(actions){ actions.setLoadingState(true); }
    setServerInfo("Score: Stand by, being calculated (might take some time) ...");

    const settings = {route: "query", element: data['Element'], energy: data['RawData_Xname'], abs: data['RawData_Yname'],
                      XANES_Data: {XANES_x: data['XANES_Data']['XANES_x'], XANES_y: data['XANES_Data']['XANES_y']}, 
                      EXAFS_Data: {EXAFS_x: data['EXAFS_Data']['EXAFS_x'], EXAFS_y: data['EXAFS_Data']['EXAFS_y']},
                      Min_Data_Option: minPoint}


    const res = await api.views.sendRequestViewUpdate({settings: settings, id: null, type: 'XAFSAnalysis'}, data);
    const retres = res.data;

    console.log(retres);
    setRetres(retres);
    setServerInfo("Score: " );

    if(actions){ actions.setLoadingState(false); }

    return true;
  }

//-------------------------------------------------------------------------------------------------
// MinPoint Slider Part
//-------------------------------------------------------------------------------------------------
  const MinpointBar = (event) => {
    const minValue = parseInt(event.target.value);
    
    // Create new data and make certain data points red
    const newDataWithHighlightedPoint = XANES_data.map((point, index) => {
      if (index === (minValue)) { // Data points corresponding to slider values
        return { ...point, highlighted: true }; // Set flag to make red
      } else {
        return { ...point, highlighted: false };
      }
    });

  setMinPoint(minValue);
  setChartData(newDataWithHighlightedPoint); 
  data['Min_Data_Option'] = minValue;
  };


  // Reapply zoom when data or minimum point changes
  useEffect(() => {
    const svg = d3.select(rootNode.current);
    requestAnimationFrame(() => {
      const transform = currentTransformRef.current;
      if (transform) {
        svg.call(zoomRef.current.transform, transform);
      }
    });
  }, [minPoint, XANES_data]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.width = `${internalOptions.extent.width}px`;
      containerRef.current.style.height = `${internalOptions.extent.height}px`;
    }
  }, [internalOptions.extent.width, internalOptions.extent.height]);

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '(1000%/750) (24000%/750) (25000%/750) (24000%/750) (1000%/750)',
    gridTemplateRows: '(8000/660)% (10000/660)% (15000/660)% (25000/660)% (8000/660)%',
    gap : '10px',
    width: '100%',
    height: '100%',
  };

  const gridItemStyle = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ccc',
  };


  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={gridContainerStyle} className="grid-container">
        <div style={{ gridColumn:"1 / span 3", gridRow:"2 / span 4", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
          <svg ref={rootNode} />
        </div>

        <div style={{ gridColumn: "1 / span 3", gridRow: "2 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto",
                      textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>
          {selectedButton}
        </div>
      
        <div style={{ gridColumn:"2 / span 3", gridRow:"1 / span 1", position: "relative", marginTop: "auto", marginBottom: "auto",
                    padding: "10px", boxSizing: "content-box", border: "2px solid black", textAlign: "center", fontSize: "24px"}}>
          {oxide} <br /> 
          <br />
          {valence_group}{valence_each}
        </div>
      
        <div style={{ gridColumn:"4 / span 2", gridRow:"2 / span 2", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
          <div ref={statsNode} />
        </div>
      
        <div style={{ gridColumn:"4 / span 2", gridRow:"4 / span 2", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
          <svg ref={triangleNode} />
        </div>
      
        <div style={{ gridColumn:"3 / span 1", gridRow:"5 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
          <Button icon color ="blue" onClick={() => handleRecalculate(data)} > 
          Recalculate 
          </Button>
          {dataUpdated && redrawScatterPlot()}
        </div>

        <div style={{ gridColumn:"1 / span 2", gridRow:"5 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto",
                      textAlign: "center", fontSize: "18px", id: "MinpointCount"}}>
          Min Data point: {minPoint + 1}<br />
          <input 
            type="range" 
            min={0} 
            max={XANES_data.length > 1 ? XANES_data.length - 1 : 0}
            value={minPoint}
            onChange={MinpointBar}
          />
        </div>
      </div>
    </div>
  );
};


XAFSAnalysis.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.object,
};

XAFSAnalysis.defaultProps = {
  data: {},
  options: {},
}

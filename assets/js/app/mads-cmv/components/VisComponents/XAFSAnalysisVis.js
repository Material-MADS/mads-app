/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
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
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button, Confirm, Form, Modal, Icon, Slider } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
//import ReactSlider from "react-slider";
//import "rc-slider/assets/index.css";

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
  margin: { top: 60, right: 40, bottom: 40, left: 40 },
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
// Get Chart Data
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------


export default function XAFSAnalysis({
  data,
  options,
  actions,
}) {
  const rootNode = useRef(null);
  const statsNode = useRef(null);
  const triangleNode = useRef(null);
  const internalOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [minPoint, setMinPoint] = useState(19); // 初期値は20番目のデータ
  const [new_data, setNewData] = useState([]); // new_dataをステートとして管理
  const [XANES_data, setChartData] = useState(defaultData);
  const [selectedButton, setSelectedButton] = useState("Raw Data");
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  const [currentServerInfo, setServerInfo] = useState("No Info");
  const [retres, setRetres] = useState(null);
  const [stats, setStats] = useState(null);
  const [oxide, setOxide] = useState('');
  const [valence_group, setValenceGroup] = useState('');
  const [valence_each, setValenceEach] = useState('');
  console.log(data)
  
  // let oxide;
  // if (data.Predict_Oxide === 0) {
  //   oxide = 'This is "Non-Oxide"';
  // } else if (data.Predict_Oxide === 1) {
  //   oxide = 'This is "Oxide"';
  // } else {
  //   oxide = ''; // それ以外のときは空文字列にする
  // }

  // let valence_group;
  // if (data.Predict_Valence_Group === 0) {
  //   valence_group = 'Valence (Group) 0 ';
  // } else if (data.Predict_Valence_Group === "1 - 3") {
  //   valence_group = 'Valence (Group) 1-3 ';
  // } else if (data.Predict_Valence_Group === "4 - 6") {
  //   valence_group = 'Valence (Group) 4-6 ';
  // } else {
  //   valence_group = ''; // それ以外のときは空文字列にする
  // }  

  // let valence_each;
  // if (data.Predict_Valence_Each === 0) {
  //   valence_each = '& (Each) 0';
  // } else if (data.Predict_Valence_Each === 1) {
  //   valence_each = '& (Each) 1';
  // } else if (data.Predict_Valence_Each === 2) {
  //   valence_each = '& (Each) 2';
  // } else if (data.Predict_Valence_Each === 3) {
  //   valence_each = '& (Each) 3';
  // } else if (data.Predict_Valence_Each === 4) {
  //   valence_each = '& (Each) 4';
  // } else if (data.Predict_Valence_Each === 5) {
  //   valence_each = '& (Each) 5';
  // } else if (data.Predict_Valence_Each === 6) {
  //   valence_each = '& (Each) 6';
  // } else {
  //   valence_each = ''; // それ以外のときは空文字列にする
  // }  

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
        console.error('XANES data is missing or lengths do not match.');
        XANES_data = []; // Or set to default XANES data if available
      }
    
      if (data['EXAFS_Data'] && data['EXAFS_Data']['EXAFS_x'] && data['EXAFS_Data']['EXAFS_y'] &&
          data['EXAFS_Data']['EXAFS_x'].length === data['EXAFS_Data']['EXAFS_y'].length) {
        EXAFS_data = data['EXAFS_Data']['EXAFS_x'].map((x, i) => ({ x, y: data['EXAFS_Data']['EXAFS_y'][i] }));
      } else {
        console.error('EXAFS data is missing or lengths do not match.');
        EXAFS_data = []; // Or set to default EXAFS data if available
      }
    } else {
      console.error('data["X"] or data["Y"] is missing or lengths do not match. Using default data.');
      new_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
      // Optionally set default XANES_data and EXAFS_data if initial state should include them
      XANES_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
      EXAFS_data = defaultData['X'].map((x, i) => ({ x, y: defaultData['Y'][i] }));
    }

    
    // console.log(XANES_data)
    // console.log(data.Energy)

    setChartData(XANES_data);

    // Updated new_data
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

      // デフォルトはnew_dataのスケールを使用
    let xExtent = d3.extent(new_data, d => d.x);
    let yExtent = d3.extent(new_data, d => d.y);

    let xExtent2 = d3.extent(new_data, d => d.x);
    let yExtent2 = d3.extent(new_data, d => d.y);

    // XANES_dataの場合はそのスケールを使用
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
      .domain(xExtent) // input range
      .range([0, width]);                                       // output range

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);

    // xScale2 and yScale2 for the secondary axes
    const xScale2 = d3.scaleLinear()
      .domain(xExtent2) // input range
      .range([0, width]);                                       // output range

    const yScale2 = d3.scaleLinear()
      .domain(yExtent2)
      .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxis2 = d3.axisTop(xScale2);
    const yAxis2 = d3.axisRight(yScale2);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x-axis")
      .call(xAxis2);

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width},0)`)
      .call(yAxis2);

    svg.append("g")
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
      .attr("stroke-dasharray", "2,2");

    svg.append("g")
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
      .attr("stroke-dasharray", "2,2");

      // 状態に基づいてテキストを追加
      svg.append("text")
      .attr("x", width / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .style("font-weight", "bold")
      .text(selectedButton);

       // x軸ラベルとy軸ラベルのテキストを選択されたボタンに応じて設定
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
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
           // Initial: transparency
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
        });
        return isDefaultData ? 'none' : 'green';
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
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot')
        .data(XANES_data.filter((d, i) => i === minPoint)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', '#FF1493') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);

        // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot1')
        .data(XANES_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);
         break;

      case "EXAFS":
        xAxisLabelTop = "";
        xAxisLabelBottom = "R / Å";
        yAxisLabelLeft = "RSF";
        yAxisLabelRight = "";
        svg.selectAll(".dot-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-exafs")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        svg.selectAll('.highlighted-dot1')
        .data(EXAFS_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
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
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
           // Initial: transparency
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
        });
        return isDefaultData ? 'none' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);
        svg.selectAll(".dot-xanes")
        .data(XANES_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-xanes")
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot')
        .data(XANES_data.filter((d, i) => i === minPoint)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', '#FF1493') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);

          // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot1')
        .data(XANES_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "EXAFS & Raw Data":
        xAxisLabelTop = "Energy / eV";
        xAxisLabelBottom = "R / Å";
        yAxisLabelLeft = "RSF";
        yAxisLabelRight = "Abs.";
        svg.selectAll(".dot-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-exafs")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);
        svg.selectAll(".dot")
        .data(new_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
           // Initial: transparency
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
        });
        return isDefaultData ? 'none' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);

        svg.selectAll('.highlighted-dot1')
        .data(EXAFS_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);
        break;

      case "XANES & EXAFS":
        xAxisLabelTop = "R / Å";
        xAxisLabelBottom = "Energy / eV";
        yAxisLabelLeft = "Norm. Abs.";
        yAxisLabelRight = "RSF";
        svg.selectAll(".dot-xanes")
        .data(XANES_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-xanes")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", (d, i) => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'blue';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        svg.selectAll(".dot-exafs")
        .data(EXAFS_data.filter(d => d.x != null && d.y != null))
        .enter().append("circle")
        .attr("class", "dot-exafs")
        .attr("cx", d => xScale2(d.x))
        .attr("cy", d => yScale2(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
          // Initial: transparency
         const isDefaultData = new_data.every((point, i) => {
           return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
       });
       return isDefaultData ? 'none' : 'orange';
       })
        .attr("fill-opacity", internalOptions.marker.opacity);

        // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot')
        .data(XANES_data.filter((d, i) => i === minPoint)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', '#FF1493') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);

          // 赤い点の描画 (最後に描画されるので最前面に表示される)
        svg.selectAll('.highlighted-dot1')
        .data(XANES_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
          .attr("fill-opacity", internalOptions.marker.opacity);

          svg.selectAll('.highlighted-dot1')
        .data(EXAFS_data.filter(d => highlightedPoint && d.x === highlightedPoint.x && d.y === highlightedPoint.y)) // 赤い点は選択されたインデックスのみ
        .enter().append('circle')
          .attr('class', 'highlighted-dot1 blinking')
          .attr('cx', d => xScale2(d.x))
          .attr('cy', d => yScale2(d.y))
          .attr('r', 5)
          .attr('fill', 'red') // 赤色で描画
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
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", internalOptions.marker.size)
        .attr("fill", d => {
           // Initial: transparency
          const isDefaultData = new_data.every((point, i) => {
            return point.x === defaultData['X'][i] && point.y === defaultData['Y'][i];
        });
        return isDefaultData ? 'none' : 'green';
        })
        .attr("fill-opacity", internalOptions.marker.opacity);
    }

    // x軸ラベルの更新（上）
    svg.selectAll(".x-axis-label-top").remove(); // 既存のラベルを削除
    svg.append("text")
      .attr("class", "x-axis-label-top")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "black")
      .text(xAxisLabelTop);

    // x軸ラベルの更新（下）
    svg.selectAll(".x-axis-label-bottom").remove(); // 既存のラベルを削除
    svg.append("text")
      .attr("class", "x-axis-label-bottom")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "black")
      .text(xAxisLabelBottom);

    // y軸ラベルの更新（左）
    svg.selectAll(".y-axis-label-left").remove(); // 既存のラベルを削除
    svg.append("text")
      .attr("class", "y-axis-label-left")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "black")
      .text(yAxisLabelLeft);

    // y軸ラベルの更新（右）
    svg.selectAll(".y-axis-label-right").remove(); // 既存のラベルを削除
    svg.append("text")
      .attr("class", "y-axis-label-right")
      .attr("transform", "rotate(90)")
      .attr("x", height / 2)
      .attr("y", -width - 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "black")
      .text(yAxisLabelRight);

///// Statistics////////////////////////
    const XANES_statistics = {
      XANES_statistics_Maxx: data.XANES_statistics_Maxx || 0,
      XANES_statistics_Maxy: data.XANES_statistics_Maxy || 0,
      XANES_statistics_E0x: data.XANES_statistics_E0x || 0,
      XANES_statistics_E0y: data.XANES_statistics_E0y || 0,
      XANES_statistics_Minx: data.XANES_statistics_Minx || 0,
      XANES_statistics_Miny: data.XANES_statistics_Miny || 0
    };

    const EXAFS_statistics = {
      EXAFS_statistics_y: data.EXAFS_statistics_y || 0,
      EXAFS_statistics_x: data.EXAFS_statistics_x || 0
    };

    const stats = computeStatistics(new_data, XANES_statistics, EXAFS_statistics);
    renderTable(stats);

  }, [data, internalOptions, selectedButton, minPoint, highlightedPoint]); 

  const computeStatistics = (new_data, XANES_statistics, EXAFS_statistics) => {
    if (!new_data || new_data.length === 0){
      return{
        XA_Maxx: 0,
        XA_Maxy: 0,
        XA_E0x: 0,
        XA_E0y: 0,
        XA_Minx: 0,
        XA_Miny: 0,
        EX_Maxy: 0,
        EX_Maxyxposition: 0,
      };
    }

    return {
      XA_Maxx: XANES_statistics.XANES_statistics_Maxx,
      XA_Maxy: XANES_statistics.XANES_statistics_Maxy,
      XA_E0x: XANES_statistics.XANES_statistics_E0x,
      XA_E0y: XANES_statistics.XANES_statistics_E0y,
      XA_Minx: XANES_statistics.XANES_statistics_Minx,
      XA_Miny: XANES_statistics.XANES_statistics_Miny,
      EX_Maxy: EXAFS_statistics.EXAFS_statistics_y,
      EX_Maxyxposition: EXAFS_statistics.EXAFS_statistics_x,
    };
  };

  const tableBorderStyle = {
    border: "1px solid black",
    padding: "10px",
    borderRadius: "5px",
  };

  // CSSで点滅アニメーションを定義
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

    // マウスエンターハンドラ
  const handleMouseEnter = (point) => {
    setHighlightedPoint(point);
  };

  // マウスリーブハンドラ
  const handleMouseLeave = () => {
    setHighlightedPoint(null);
  };

  const renderTable = (stats) => {
    // console.log("Rendering table with stats:", stats);

    const formatNumber = (number) => {
      return number.toFixed(2); // 小数点第2位までのフォーマット
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
              <td>EX_Maxy:</td>
              <td>{formatNumber(stats.EX_Maxy)}</td>
            </tr> 
            <tr onMouseEnter={() => handleMouseEnter({ x: stats.EX_Maxyxposition, y: stats.EX_Maxy })} onMouseLeave={handleMouseLeave}>
              <td>EX_Maxyxposition:</td>
              <td>{formatNumber(stats.EX_Maxyxposition)} Å</td>
            </tr>                       
          </tbody>
        </table>
      </div>
    )

    if (statsNode.current){
      ReactDOM.render(table, statsNode.current);
    }
  };

   // retresが更新されたときに統計量を計算し、テーブルを再レンダリング
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
        EXAFS_statistics_y: retres.EXAFS_statistics_y || 0,
        EXAFS_statistics_x: retres.EXAFS_statistics_x || 0
      };

      const newStats = computeStatistics(retres, XANES_statistics, EXAFS_statistics);
      setStats(newStats);
    }
  }, [retres, minPoint, selectedButton, highlightedPoint]);

  const getOxideText = (predictOxide) => {
    if (predictOxide === 0) {
      return 'This is "Non-Oxide"';
    } else if (predictOxide === 1) {
      return 'This is "Oxide"';
    } else {
      return ''; // それ以外のときは空文字列にする
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
      return ''; // それ以外のときは空文字列にする
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
        return ''; // それ以外のときは空文字列にする
    }
  };
  
  // useEffect フックの定義
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
  
  // statsが更新されたときにテーブルを再レンダリング
  useEffect(() => {
    if (stats) {
      renderTable(stats);
    }
  }, [stats]);

///// triangle////////////////////////
  useEffect(() => {
    const triangleVertices = [
      { x: 75, y: 200 },
      { x: 125, y: 100 },
      { x: 175, y: 200 }
    ];

    const triangle_svg = d3.select(triangleNode.current)
      .attr("width", internalOptions.extent.width)
      .attr("height", internalOptions.extent.height)
      .append("g")
      // console.log(internalOptions.extent.width)

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
    });

    triangle_svg.selectAll("circle")
      .on("click", function() {
        d3.select(triangleNode.current).selectAll("circle").attr("fill", "black");
        d3.select(triangleNode.current).selectAll("line").attr("stroke", "black");
        d3.select(this).attr("fill", "red");
        const buttonName = d3.select(this).attr("id");
        setSelectedButton(buttonName);
    });

  }, []); 

//// Oxide Valence Show///////////////
  // const handleClick = () => {
  //  setShowMessage(!showMessage);
  // };

//// Recalculate (Button)///////////////

  const handleRecalculate = async (data) => {
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


//// MinPointBar (Slider)///////////////
  const MinpointBar = (event) => {
    const minValue = parseInt(event.target.value); // スライダーの値を整数に変換
    
    // 新しいデータを作成し、特定のデータ点を赤色にする
    const newDataWithHighlightedPoint = XANES_data.map((point, index) => {
      console.log("Index:", index);
      if (index === (minValue)) { // スライダーの値に対応するデータ点
        console.log("highlighted: true"); 
        return { ...point, highlighted: true }; // 赤色にするためのフラグを設定
      } else {
        return { ...point, highlighted: false }; // 他のデータ点は赤色にしない
      }
    });

  setMinPoint(minValue); // スライダーの値をセット
  setChartData(newDataWithHighlightedPoint); // 赤色にしたデータ点を含む新しいデータをセット
  console.log("New data with highlighted point:", newDataWithHighlightedPoint);
  data['Min_Data_Option'] = minValue;
  };


  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 250px 250px", gridTemplateRows: "80px 250px 250px 100px" }}>
      <div style={{ gridColumn:"1 / span 2", gridRow:"2 / span 2", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
        <svg ref={rootNode} />
      </div>
      
      <div style={{ gridColumn:"1 / span 3", gridRow:"1 / span 1", position: "relative", marginTop: "auto", marginBottom: "auto",
                    padding: "20px", boxSizing: "content-box", border: "2px solid black", textAlign: "center", fontSize: "24px"}}>
        {oxide} <br /> 
        <br />
        {valence_group}{valence_each}.
      </div>
      
      <div style={{ gridColumn:"3 / span 1", gridRow:"2 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
        <div ref={statsNode} />
      </div>
      
      <div style={{ gridColumn:"3 / span 1", gridRow:"3 / span 2", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
        <svg ref={triangleNode} />
      </div>
      
      <div style={{ gridColumn:"2 / span 1", gridRow:"4 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto"}}>
        <Button icon color ="blue" onClick={() => handleRecalculate(data)} > 
        Recalculate 
        </Button>
        {dataUpdated && redrawScatterPlot()}
      </div>

      <div style={{ gridColumn:"1 / span 1", gridRow:"4 / span 1", position: "relative", marginLeft: "auto", marginRight: "auto", marginTop: "auto", marginBottom: "auto",
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

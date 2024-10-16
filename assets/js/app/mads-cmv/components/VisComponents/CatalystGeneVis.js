/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'CatalystGeneVC' module
// ------------------------------------------------------------------------------------------------
// Notes: 'CatalystGeneVC' is a visualization component that can display more or less any of the other
//        VizComps available based on a range of available properties.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs
=================================================================================================*/

// IMPORT SECTION
//===================================================================================================================
// Main Dependent libraries (React and related)
//---------------------------------------------
import React, { useState, useEffect, useRef, } from "react";
import PropTypes from "prop-types";
import { DataFrame } from 'pandas-js';
import * as Bokeh from "@bokeh/bokehjs";
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { cmMax } from '../Views/FormUtils';
import SemCheckbox from '../FormFields/Checkbox';
import { Field, reduxForm, Label } from 'redux-form';
import * as deepEqual from 'deep-equal'


// Available Visual Components to be used with this customizable one
//------------------------------------------------------------------
import BarChart from "./BarVis";
import LineChart from "./LineChartVis";
import ClassificationVis from "./ClassificationVis";
import HeatMap from "./HeatMapVis";
import ImageView from "./ImageVis";
import Molecule3D from './Molecule3DVis';
import PeriodicTableChart from "./PeriodicTableVis";
import PieChart from "./PieChartVis";
import QuadBarChart from "./QuadBarChartVis";
import RegressionVis from "./RegressionVis";
import Scatter from "./ScatterVis";
import Scatter3D from './Scatter3DVis';
import { root } from "postcss";


// CONSTANTS AND VARIABLES
//===================================================================================================================

//----------------------------------------------------------------------------------
// CONSTANT VARIABLE: defaultOptions
// object that contains all default settings for this visual component
//----------------------------------------------------------------------------------
const defaultOptions = {
  title: "Catalyst Gene Analysis",           // Displayed Name/Title of the component
  extent: { width: 600, height: 600 },        // Size (Width & Height) of the component
  axisLabels: ['x', 'y'],
  x_range: [-1.0, 10],
  y_range: [-1.0, 10],
  legendLabel: undefined,
  margin: { l: 0, r: 10, b: 10, t: 10},
  modebar: { orientation: 'h'},
  lineWidth: 2,
  lineDash: undefined,
  colorMap: 'Category10',  
  tools: 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save',
  mappings: {
    xData: 'xData',
    yData: 'yData',
    heatVal: 'heatVal',
  },
  toolTipTitles: ['Catalyst', 'HeatValue'],
  heatValUnit: '',
  fontSize: '7px'
   // Which Visual Component to use for displaying data
};
//----------------------------------------------------------------------------------


//----------------------------------------------------------------------------------
// CONSTANT VARIABLE: availableComponents
// object that contains all available Visual Coponents this custom component can display
//----------------------------------------------------------------------------------
const availableComponents = {
  BarChart: BarChart,
  LineChart: LineChart,
  ClassificationVis: ClassificationVis,
  HeatMap: HeatMap,
  ImageView: ImageView,
  Molecule3D: Molecule3D,
  PeriodicTableChart: PeriodicTableChart,
  PieChart: PieChart,
  QuadBarChart: QuadBarChart,
  RegressionVis: RegressionVis,
  Scatter: Scatter,
  Scatter3D: Scatter3D,
};
//----------------------------------------------------------------------------------

//===================================================================================================================



// MAIN CLASS OBJECT
//===================================================================================================================

//----------------------------------------------------------------------------------
// CLASS: CatalystGeneVC
// The main Visual Component, that is of custom type, meaning that it can be set and
// configured into any of the exisiting stand alone visual components and more.
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
const getMaxPoint = (linePoints) => {
  let maxPoint = -Infinity;
  linePoints.forEach(line => {
    line.forEach(point => {
      if (point > maxPoint) {
        maxPoint = point;
      }
    });
  });
  return maxPoint;
};

const getMinPoint = (linePoints) => {
  let minPoint = Infinity;
  linePoints.forEach(line => {
    line.forEach(point => {
      if (point < minPoint) {
        minPoint = point;
      }
    });
  });
  return minPoint;
};


function Clustering({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data;
  const rootNode = useRef(null);
  useEffect(() => {
    if (!rootNode.current) return;
    rootNode.current.innerHTML = '';
    const rootCatalyst = data["rootCatalyst"];
    const similarGeneCatalyst = data["similarGeneCatalyst"]
    const { extent, margin } = internalOptions;
    const { width, height } = extent;
    const { l: left, r: right, t: top, b: bottom } = margin;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const yTickLabels = internalData['clusteringTicks']
    const linePoints = internalData['clusteringData'];
    const maxXPoint = getMaxPoint(linePoints.map(p => [p[0], p[2]]));
    const maxYPoint = getMaxPoint(linePoints.map(p => [p[1], p[3]]));
  
    const scaleX = plotWidth / maxXPoint;
    const scaleY = plotHeight / maxYPoint;


    const source = new Bokeh.ColumnDataSource({
      data: {
        x0: linePoints.map(p => (p[0] * scaleX * 0.95 + plotWidth*0.05)),
        y0: linePoints.map(p => (p[1] * scaleY * 0.95 + plotHeight*0.025)),
        x1: linePoints.map(p => (p[2] * scaleX * 0.95 + plotWidth*0.05)),
        y1: linePoints.map(p => (p[3] * scaleY * 0.95 + plotHeight*0.025)),
      }
    });

    const minY = Math.min(Math.min(...source.data.y0),Math.min(...source.data.y1))
    const maxY = Math.max(Math.max(...source.data.y0),Math.max(...source.data.y1))
    const yTickPoint = yTickLabels.map((label, index) => ((maxY - minY) / (yTickLabels.length - 1)) * index + minY)
    const yTickDiff = yTickPoint[1] - yTickPoint[0]
    const xRange = new Bokeh.Range1d({ start: 0, end: plotWidth });
    const yRange = new Bokeh.Range1d({ start: 0, end: plotHeight });

    const plot = new Bokeh.Plotting.figure({
      tools: internalOptions.tools,
      width: plotWidth,
      height: plotHeight,
      x_range: xRange,
      y_range: yRange,
    });

    const hierarchy = plot.segment({ field: 'x0' }, { field: 'y0' }, { field: 'x1' }, { field: 'y1' }, { source });

    const similarGeneCatalystIndxs = similarGeneCatalyst.map((label,index) => yTickLabels.indexOf(label))
    const similarGeneCatalystYPoints = similarGeneCatalystIndxs.map((index) => yTickPoint[index])
    const circleX = Array.from({ length: similarGeneCatalystYPoints.length }, () => plotWidth*0.02);
    const rootCatalystIndex =  yTickLabels.indexOf(rootCatalyst)
    const yRootCatalyst = yTickPoint[rootCatalystIndex]
    const circleColor = similarGeneCatalystYPoints.map((yPoint) => yPoint === yRootCatalyst ? 'green': 'yellow');
    const ellipseheight = Array.from({ length: similarGeneCatalystYPoints.length }, () => yTickDiff*0.98);
    const ellipsewidth = Array.from({ length: similarGeneCatalystYPoints.length }, () => 15);


    const similarGeneSource = new Bokeh.ColumnDataSource({
      data: {
        xData: circleX,
        yData: similarGeneCatalystYPoints,
        height:ellipseheight,
        width:ellipsewidth,
        color:circleColor,
      }
    });

    const circles = plot.ellipse({
      x: { field: "xData" },
      y: { field: "yData" },
      width: { field: "width" },
      height: { field: "height" },
      fill_color:{ field: "color" },
      line_color:{ field: "color" },
      source: similarGeneSource,
    });

    if (yTickLabels.length > 0) {
      const yaxis = plot.yaxis[0];
      yaxis.ticker = new Bokeh.FixedTicker({ ticks: yTickPoint });
      yaxis.major_label_orientation = 0;
      yaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: yTickLabels, tickPoints: yTickPoint },
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind] ? labels[ind] : '';
        `
      });    
    }

    Bokeh.Plotting.show(plot, rootNode.current);

  }, [data]);

  return(
    <div>
      <div ref={rootNode} />
    </div>
  );
}

 function HeatMapGene({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data.heatmapData;
  const columnsForGene = data.columnsForGene;
  const rootNode = useRef(null);
  const [isXlabelArea, setIsXlabelArea] = useState(true);
  const [lastIndices, setLastIndices] = useState(selectedIndices)
  console.log("selectedIndices", selectedIndices)
  
  useEffect(() => {
    if (!rootNode.current) return;
    rootNode.current.innerHTML = '';
    const rootCatalyst = data["rootCatalyst"];
    const similarGeneCatalyst = data["similarGeneCatalyst"]
    const { extent, margin } = internalOptions;
    const { width, height } = extent;
    const { l: left, r: right, t: top, b: bottom } = margin;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const yTickLabels =internalData['yTicks'];
    const xTickLabels =internalData['xTicks'];
    const maxY = Math.max(...internalData['yData']);
    const minY = Math.min(...internalData['yData']);
    const maxX = Math.max(...internalData['xData']);
    const minX = Math.min(...internalData['xData']);
    const xAxisRange = maxX - minX;
    const yAxisRange = maxY - minY;
    const xRange = new Bokeh.Range1d({ start: minX-1, end: maxX +1});
    const yRange = new Bokeh.Range1d({ start: minY, end: maxY +1});
    const handleSelectedIndicesChange = () => {
      const indices = source.selected.indices;
      console.log("indices", indices)
      if (onSelectedIndicesChange && !deepEqual(lastIndices, indices)) {
        onSelectedIndicesChange(indices);
        setLastIndices([...indices]);
      }
    }

    let colors = internalOptions.colors;
    if(!colors){
      colors = (cmMax[internalOptions.colorMap] != undefined) ? allPal[internalOptions.colorMap+cmMax[internalOptions.colorMap]] : allPal[defaultOptions.colorMap+cmMax[defaultOptions.colorMap]];
    }

    const colMapMinMax = internalOptions.colorMapperMinMax ? internalOptions.colorMapperMinMax : [Math.min(...(internalData["heatVal"])), Math.max(...(internalData["heatVal"]))];
    var mapper = new Bokeh.LinearColorMapper({palette: colors, low: colMapMinMax[0], high: colMapMinMax[1]});
    const source = new Bokeh.ColumnDataSource({
      data: {
        xData: internalData['xData'].map(x => x  ),
        yData: internalData['yData'].map(y => y  ),
        heatVal: internalData['heatVal'],
        x0: internalData['xData'].map(x => 0),
        y0: internalData['yData'].map(y => 0),
        catalyst: internalData['yData'].map(y => [...internalData["yTicks"]][y] )
      }
    });

    source.selected.indices = [...lastIndices];
    source.connect(source.selected.change, () => handleSelectedIndicesChange());


    const yTickPoint = yTickLabels.map((label, index) => ((maxY - minY) / (yTickLabels.length - 1)) * index + minY)
    const yTickDiff = yTickPoint[1]-yTickPoint[0]
    const similarGeneCatalystIndxs = similarGeneCatalyst.map((label,index) => yTickLabels.indexOf(label))
    const similarGeneCatalystYPoints = similarGeneCatalystIndxs.map((index) => yTickPoint[index])
    const circleX = Array.from({ length: similarGeneCatalystYPoints.length }, () => -0.5);
    const ellipseheight = Array.from({ length: similarGeneCatalystYPoints.length }, () => yTickDiff*0.98);
    const ellipsewidth = Array.from({ length: similarGeneCatalystYPoints.length }, () => 0.2);

    const rootCatalystIndex =  yTickLabels.indexOf(rootCatalyst)
    const yRootCatalyst = yTickPoint[rootCatalystIndex]
    const circleColor = similarGeneCatalystYPoints.map((yPoint) => yPoint === yRootCatalyst ? 'green': 'yellow');

    const similarGeneSource = new Bokeh.ColumnDataSource({
      data: {
        xData: circleX,
        yData: similarGeneCatalystYPoints,
        height:ellipseheight,
        width:ellipsewidth,
        color:circleColor,
      }
    });

    const plot = new Bokeh.Plotting.figure({
      tools: internalOptions.tools,
      width: plotWidth,
      height: plotHeight,
      x_range: xRange,
      y_range: yRange,
    });
    

    const circles = plot.ellipse({
      x: { field: "xData" },
      y: { field: "yData" },
      width: { field: "width" },
      height: { field: "height" },
      fill_color:{ field: "color" },
      line_color:{ field: "color" },
      source: similarGeneSource,
    });

    const renderer = plot.rect({
      x: { field: "xData" },
      y: { field: "yData" },
      cat:{ field: "catalyst" },
      width: 1,
      height: 1,
      source: source,
      fill_color: {
        field: "heatVal",
        transform: mapper
      },
      line_color: "black",
    });
    

    let activeToolTipTitles = internalOptions.toolTipTitles || defaultOptions.toolTipTitles;
    const tooltip = [[activeToolTipTitles[0], '@'+"catalyst"],[activeToolTipTitles[1], '@'+"heatVal"],]
    plot.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [renderer] }));

    const color_bar = new Bokeh.ColorBar({
      color_mapper: mapper,
      major_label_text_font_size: internalOptions.fontSize || defaultOptions.fontSize,
      ticker: new Bokeh.BasicTicker({desired_num_ticks: colors.length}),
      formatter: new Bokeh.PrintfTickFormatter({format: "%f"+(internalOptions.heatValUnit || defaultOptions.heatValUnit)}),
      label_standoff: 6,
      border_line_color: null
    });

    const xTickPoints = Array.from({ length: internalData["yTicks"].length }, (_, index) => index - 1 / 2);
    const xLabelPoints = Array.from({ length: columnsForGene.length }, (_, index) => index );

    if ((xTickLabels.length > 0) && isXlabelArea) {
      const xaxis = plot.xaxis[0];
      xaxis.ticker = new Bokeh.FixedTicker({ ticks: xLabelPoints });
      xaxis.major_label_orientation = 45;
      xaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: xTickLabels, tickPoints: xLabelPoints },
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind] ? labels[ind] : '';
        `
      });    
    }

    if ((columnsForGene.length > 0) && !isXlabelArea) {
      const xaxis = plot.xaxis[0];
      xaxis.ticker = new Bokeh.FixedTicker({ ticks: xTickPoints });
      xaxis.major_label_orientation = 45;
      xaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: columnsForGene, tickPoints: xTickPoints },
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind] ? labels[ind] : '';
        `
      });    
    }

    plot.add_layout(color_bar, 'right');
    const labelColors = yTickLabels.map(label => label === rootCatalyst ? 'red' : 'black');
    const x0 = yTickPoint.map(y => 0)
    source.data['labelColors'] = labelColors;

    if (yTickLabels.length > 0) {
      const yaxis = plot.yaxis[0];
      yaxis.ticker = new Bokeh.FixedTicker({ ticks: yTickPoint });
      yaxis.major_label_orientation = 0;
      yaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: yTickLabels, tickPoints: yTickPoint, rootCatalyst: rootCatalyst},
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind]
          `
      });    
    }

   Bokeh.Plotting.show(plot, rootNode.current);
    // plot.js_event_callbacks = {'reset': [callback]};

  }, [data, isXlabelArea])

  const buttonWords = isXlabelArea? "Show columns Info" : "Show area Info" 

  return(
    <div id="containerHolder">
      <button
        onClick={() => {
          setIsXlabelArea(!isXlabelArea);
          }
        }
      >{buttonWords}
      </button>
      <div ref={rootNode} />
    </div>
  );
}

function ParallelGene({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data.parallelData;
  const xTickLabels = Object.keys(data.areaData);
  const columnsForGene = data.columnsForGene;
  const rootNode = useRef(null);
  const [selectCatalyst, setSelectCatalyst] = useState(null);
  const [isXlabelArea, setIsXlabelArea] = useState(true);

  useEffect(() => {
    if (!rootNode.current) return;
    rootNode.current.innerHTML = '';
    const rootCatalyst = data["rootCatalyst"];
    const similarGeneCatalyst = data["similarGeneCatalyst"]
    const { extent, margin } = internalOptions;
    const { width,height } = extent;
    const xAxisRange = internalData[rootCatalyst].length;
    const yMin = getMinPoint(Object.values(internalData));
    const yMax = getMaxPoint(Object.values(internalData));
    const yRangeMin = yMin < 0 ? yMin * 1.1 : -xAxisRange / 100;
    const yAxisRange = yMax - yMin;
    const { l: left, r: right, t: top, b: bottom } = margin;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const xRange = new Bokeh.Range1d({ start: 0, end: xAxisRange  });
    const yRange = new Bokeh.Range1d({ start: yRangeMin, end: yMax * 1.1 });


    const plot = new Bokeh.Plotting.figure({
      tools: internalOptions.tools,
      width: plotWidth,
      height: plotHeight,
      x_range: xRange,
      y_range: yRange,
    });
   

    const holizonLInes = Array.from({length:20},(_, index) => (index * yAxisRange / 20 + yMin))

    const holizonSource = new Bokeh.ColumnDataSource({
      data:{
        x0: holizonLInes.map(p => 0),
        y0: holizonLInes.map(p => p),
        x1: holizonLInes.map(p => xAxisRange),
        y1: holizonLInes.map(p => p),
      }
    });

    const backGroundSource = new Bokeh.ColumnDataSource({
      data: {
        xData: [xAxisRange / 2],
        yData: [(yMax + yRangeMin)/ 2],
      }
    });

    const labelSource = new Bokeh.ColumnDataSource({
      data:{
        xData: holizonLInes.map(p =>1 / 4),
        yData: holizonLInes.map(p => p),
        labels: Array.from(Array(20), (_, i) => String.fromCharCode(i + 65))
      }
    });

    const renderer = plot.rect({
      x: { field: "xData" },
      y: { field: "yData" },
      width: xAxisRange,
      height: yAxisRange,
      source: backGroundSource,
      fill_color: "white"
    });


    const holizonDraw = plot.segment(
      {field:"x0"},
      {field:"y0"},
      {field:"x1"},
      {field:"y1"},
      {source : holizonSource}
    );

    const xTickPoints = Array.from({ length: internalData[rootCatalyst].length }, (_, index) => index + 1 / 2);
    const xLabelPoints = Array.from({ length: columnsForGene.length }, (_, index) => index );
    
    Object.keys(internalData).forEach(catalyst => {
      const yData = internalData[catalyst].map(y => y );
      const color = catalyst === rootCatalyst ? "orange": "blue";
      const width = catalyst === rootCatalyst ? 10: 1;

      const parallelSource = new Bokeh.ColumnDataSource({
        data: { x: xTickPoints, y: yData }
      });
    
      plot.line({
        x: { field: "x" },
        y: { field: "y" },
        line_color: color,
        line_width: width,
        source: parallelSource });

      const circles = plot.ellipse({
        x: { field: "x" },
        y: { field: "y" },
        width: xAxisRange / 40,
        height: yAxisRange / 40,
        fill_color: "red",
        source: parallelSource,
      });
    });

    const labelDraw = new Bokeh.LabelSet({
      x: {field: "xData"},
      y: {field: "yData"},
      text: {field: "labels"},
      x_units: 'data',
      y_units: 'data',
      source: labelSource,
      render_mode: 'canvas',
      text_font_size: '10pt',
      text_color: 'black',
      text_align: 'center',
      text_baseline: 'bottom'
    });


    if ((xTickLabels.length > 0) && isXlabelArea) {
      const xaxis = plot.xaxis[0];
      xaxis.ticker = new Bokeh.FixedTicker({ ticks: xTickPoints });
      xaxis.major_label_orientation = 45;
      xaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: xTickLabels, tickPoints: xTickPoints },
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind] ? labels[ind] : '';
        `
      });    
    }

    if ((columnsForGene.length > 0) && !isXlabelArea) {
      const xaxis = plot.xaxis[0];
      xaxis.ticker = new Bokeh.FixedTicker({ ticks: xLabelPoints });
      xaxis.major_label_orientation = 45;
      xaxis.formatter = new Bokeh.FuncTickFormatter({
        args: { labels: columnsForGene, tickPoints: xLabelPoints },
        code: `
          const ind = tickPoints.indexOf(tick);
          return labels[ind] ? labels[ind] : '';
        `
      });    
    }

    plot.add_layout(labelDraw);

    // const circles = plot.ellipse({
    //   x: { field: "xData" },
    //   y: { field: "yData" },
    //   width: 10,
    //   height: 10,
    //   fill_color:"red",
    //   line_color:{ field: "color" },
    //   source: parallelSource,
    // });

    Bokeh.Plotting.show(plot, rootNode.current);

  }, [internalData, isXlabelArea])

  const buttonWords = isXlabelArea? "Show columns Info" : "Show area Info" 

  return(
    <div id="containerHolder">
          <button
            onClick={() => {
              setIsXlabelArea(!isXlabelArea);
              }
            }
          >{buttonWords}
          </button>
      <div ref={rootNode} />
    </div>
  );
}

function GeneTable({
  data,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data.dfDistanceIntroduced;
  const xTickLabels = Object.keys(data.areaData);
  const rootNode = useRef(null);
  console.log(selectedIndices);


  useEffect(() => {
    if (!rootNode.current) return;
    rootNode.current.innerHTML = '';
    const { extent, margin } = internalOptions;
    const { width,height } = extent;

    const colNamesInProperOrder = Object.keys(internalData);

    const tableSource = new Bokeh.ColumnDataSource({ data: internalData });
    const tString = JSON.stringify(colorTags);

    const template = `
      <div style="color:<%=
        (function() {
          var colorTags = ${tString}
          var color = 'black'
          colorTags.forEach(t => {
            if (t.itemIndices.includes(__bkdt_internal_index__)) {
              color = t.color;
              return;
            }
          });
          return color;
        }())
      %>"><%= value %></div>
    `;

    const formatter = new Bokeh.Tables.HTMLTemplateFormatter({ template });

    let displayColumns = colNamesInProperOrder.map((v) => {
      const c = new Bokeh.Tables.TableColumn({
        field: v,
        title: v,
        formatter,
      });
      return c;
    });

    const dataTable = new Bokeh.Tables.DataTable({
      source: tableSource,
      columns: displayColumns,
      width: width || defaultOptions.extent.width,//INITIAL_WIDTH,
      height: height || defaultOptions.extent.height,
      selection_color: 'red',
    });

    Bokeh.Plotting.show(dataTable, rootNode.current);

  }, [])
  return(
    <div id="containerHolder">
      <div ref={rootNode} />
    </div>
  );
}

function emptyCatalystGeneVC({data, options}) {
  const rootNode = useRef(null);
  useEffect(() => {
    if (!rootNode.current) return;
    rootNode.current.innerHTML = '';
    const internalOptions = Object.assign({}, defaultOptions, options);
    const internalData = data;

    const plot = Bokeh.Plotting.figure({
      title: internalOptions.title || 'Plot',
      tools: internalOptions.tools,
      x_range: internalOptions.x_range || [-1, 1],
      y_range: internalOptions.y_range || [-1, 1],
      width: internalOptions.extent.width || 400,
      height: internalOptions.extent.height || 400,
      toolbar_location: 'right',
    });

    Bokeh.Plotting.show(plot, rootNode.current);
  }, [data, options]);

  return (
    <div>
      <div ref={rootNode} />
    </div>
  );
}

function componentSelector(data){
  const columnNumber = (data && data.scaledData) ? Object.keys(data.scaledData).length : 0;
  const visualization = data && data["visualizationMethod"];
  let SelComp = emptyCatalystGeneVC;
  if (columnNumber > 0 && visualization){
    if (visualization === "Hierarchical Clustering"){
      SelComp = Clustering;
    } else if (visualization === 'Heatmap'){
      SelComp = HeatMapGene;
    } else if (visualization === 'Parallel-coordinate Catalyst gene introduction'){
      SelComp = ParallelGene;
    } else{
      SelComp = GeneTable;
    }
  }
  return SelComp
}
export default function CatalystGene({
  actions, 
  appMgs,
  filteredIndices,
  id,
  data, 
  options, 
  colorTags, 
  selectedIndices, 
  onSelectedIndicesChange,
  mappings,
  originalOptions,
  
  }){
  useEffect(() => {
    if(data && data.resetRequest){
      internalOptions.title = "EMPTY CUSTOM COMPONENT";
      delete data.resetRequest;
    }
  }, [data, selectedIndices]);

  const internalData = data
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalProps = Object.assign({}, colorTags, selectedIndices, onSelectedIndicesChange);
  const SelComp = componentSelector(internalData)
  const params = { data, mappings, options, colorTags, selectedIndices, onSelectedIndicesChange,}

  return (
    <div id="containerHolder">
      <SelComp {...params} />
    </div>
  );

}



//----------------------------------------------------------------------------------
// OPJECT DEFINES: propTypes
// Defining the types for various properties this Visual Component should manage
// and recieve.
//----------------------------------------------------------------------------------
CatalystGene.propTypes = {
  options: PropTypes.shape({
    title: PropTypes.string,
    VisComp: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};

//----------------------------------------------------------------------------------

//----------------------------------------------------------------------------------
// OPJECT DEFINES: defaultProps
// Defining the default initial values for the various parameters this Visual
// Component should use.
//----------------------------------------------------------------------------------
CatalystGene.defaultProps = {
  options: defaultOptions,
};
//----------------------------------------------------------------------------------

//===================================================================================================================

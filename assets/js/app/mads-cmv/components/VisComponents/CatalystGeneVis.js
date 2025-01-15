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
import { useSelector } from "react-redux";
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
// A function that marks catalysts with a yellow marker whose edit distance is less than the user-specified value.
//---------------------------------------------------------------------------------------

const markerMaker = (dfData, rootCatalyst, similarDistance, minY, maxY, minX, maxX, yTickLabels) => {
  const similarIndex = dfData.distance.map((dist, ind) => (dist <= similarDistance ? ind : null)).filter(ind => (ind !== null) & (ind !== 0));
  const similarGeneCatalyst = similarIndex.map(ind => dfData.Catalyst[ind])
  if(!Object(similarGeneCatalyst).includes(rootCatalyst)){
    similarGeneCatalyst.push(rootCatalyst);
  }
  const yTickPoint = yTickLabels.map((label, index) => ((maxY - minY) / (yTickLabels.length - 1)) * index + minY)
  const yTickDiff = yTickPoint[1]-yTickPoint[0]
  const similarGeneCatalystIndxs = similarGeneCatalyst.map((label,index) => yTickLabels.indexOf(label))
  
  const similarGeneCatalystYPoints = similarGeneCatalystIndxs.map((index) => yTickPoint[index])
  const circleX = Array.from({ length: similarGeneCatalystYPoints.length }, () => -maxX*0.025);
  const ellipseheight = Array.from({ length: similarGeneCatalystYPoints.length }, () => yTickDiff*0.98);
  const ellipsewidth = Array.from({ length: similarGeneCatalystYPoints.length }, () => maxX*0.05);

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
  return similarGeneSource;
}

//----------------------------------------------------------------------------------------------
// A function that displays information when hovering over the input frame that specifies the editdistance value.
//---------------------------------------------------------------------------------------

const DelayedTooltip = ({ similarDistance, maxDistance, setSimilarDistance }) => {
  
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef(null); 

  // Detect the hover and after 20 ms information will comes up
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 20); 
  };

  // Detect the mouse off and reset timerRef
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setShowTooltip(false);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input
        value={similarDistance}
        type="number" 
        id="tentacles" 
        name="tentacles" 
        min="0" 
        max={maxDistance} 
        onInput={(event) =>{
          setSimilarDistance(event.target.value);
        }
      }/>
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "120%",
            left: "0%",
            transform: "translateX(0%)",
            backgroundColor: "white",
            color: "black",
            padding: "15px",
            borderRadius: "15px",
            whiteSpace: "nowrap",
            zIndex: 1,
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
          }}
        >
          Change the value of edit_distance
        </div>
      )}
    </div>
  );
};

//----------------------------------------------------------------------------------------------
// A function to visualize the result of Hierarchical Clustering
//---------------------------------------------------------------------------------------

function Clustering({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  // Get data and options. Set visualizetion size and graph ticks.
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data;
  const rootNode = useRef(null);
  const [similarDistance, setSimilarDistance] = useState(0);
  const dfData = internalData.dfDistanceIntroduced;
  const rootCatalyst = internalData["rootCatalyst"];
  const linePoints = internalData['clusteringData'];
  const minY = Math.min(Math.min(...linePoints.map(p => p[1])),Math.min(...linePoints.map(p => p[3])))
  const maxY = Math.max(Math.max(...linePoints.map(p => p[1])),Math.max(...linePoints.map(p => p[3])))
  const minX = Math.min(Math.min(...linePoints.map(p => p[0])),Math.min(...linePoints.map(p => p[2])))
  const maxX = Math.max(Math.max(...linePoints.map(p => p[0])),Math.max(...linePoints.map(p => p[2])))
  const maxDistance = Math.max(...dfData.distance);
  const { extent, margin } = internalOptions;
  const { width, height } = extent;
  const { l: left, r: right, t: top, b: bottom } = margin;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const yTickLabels = internalData['clusteringTicks'];
  const yTickPoint = yTickLabels.map((label, index) => ((maxY - minY) / (yTickLabels.length - 1)) * index + minY);
  const xRange = new Bokeh.Range1d({ start: -maxX * 0.05, end: maxX * 1.1 });
  const yRange = new Bokeh.Range1d({ start: -maxY * 0.05, end: maxY * 1.1 });

  useEffect(() => {
    //  If there is not a rootNode.current stop the process
    if (!rootNode.current) return;

    //  Initiate the rootNode
    rootNode.current.innerHTML = '';

    // Create ColumnDataSource with clustering data
    const source = new Bokeh.ColumnDataSource({
      data: {
        x0: linePoints.map(p => (p[0] )),
        y0: linePoints.map(p => (p[1] )),
        x1: linePoints.map(p => (p[2] )),
        y1: linePoints.map(p => (p[3] )),
      }
    });

    // Create the canvas to show clustering figure
    const plot = new Bokeh.Plotting.figure({
      tools: internalOptions.tools,
      width: plotWidth,
      height: plotHeight,
      x_range: xRange,
      y_range: yRange,
    });

    // Create clustering with segment 
    const hierarchy = plot.segment({ field: 'x0' }, { field: 'y0' }, { field: 'x1' }, { field: 'y1' }, { source });

    // Select catalyst to mark on yTick label
    const similarGeneSource = markerMaker(dfData, rootCatalyst, similarDistance, minY, maxY, minX, maxX, yTickLabels)

    // Mark catalysts with edit distance less than the specified value
    const circles = plot.ellipse({
      x: { field: "xData" },
      y: { field: "yData" },
      width: { field: "width" },
      height: { field: "height" },
      fill_color:{ field: "color" },
      line_color:{ field: "color" },
      source: similarGeneSource,
    });

    // Display catalyst name on yTick label
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

    // Show clustering
    Bokeh.Plotting.show(plot, rootNode.current);

  }, [data, similarDistance]);

  return(
    <div>
      <DelayedTooltip 
        similarDistance={similarDistance} 
        setSimilarDistance={setSimilarDistance} 
        maxDistance={maxDistance} 
      />
      <div ref={rootNode} />
    </div>
  );
}

//----------------------------------------------------------------------------------------------
//  A function to visualize the result of HeatMap
//---------------------------------------------------------------------------------------
function HeatMapGene({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data.heatmapData;
  const dfData = data.dfDistanceIntroduced;
  const columnsForGene = data.columnsForGene;
  const rootCatalyst = data["rootCatalyst"];

  const maxY = Math.max(...internalData['yData']);
  const minY = Math.min(...internalData['yData']);
  const maxX = Math.max(...internalData['xData']);
  const minX = Math.min(...internalData['xData']);
  const rootNode = useRef(null);
  const yTickLabels =internalData['yTicks'];
  const xTickLabels =internalData['xTicks'];
  const yTickPoint = yTickLabels.map((label, index) => ((maxY - minY) / (yTickLabels.length - 1)) * index + minY);
  const xTickPoints = Array.from({ length: internalData["yTicks"].length }, (_, index) => index);
  const xLabelPoints = Array.from({ length: columnsForGene.length }, (_, index) => index + 1/2);

  const { extent, margin } = internalOptions;
  const { width, height } = extent;
  const { l: left, r: right, t: top, b: bottom } = margin;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xRange = new Bokeh.Range1d({ start: -maxX * 0.05, end: maxX + 1.5});
  const yRange = new Bokeh.Range1d({ start: -maxY * 0.1, end: maxY * 1.1 });

  const [isXlabelArea, setIsXlabelArea] = useState(true);
  const [similarDistance, setSimilarDistance] = useState(0);
  const [lastIndices, setLastIndices] = useState([...selectedIndices])

  const buttonWords = isXlabelArea? "Show columns Info" : "Show area Info" 
  const maxDistance = Math.max(...dfData.distance);

  
  useEffect(() => {
    //  If there is not a rootNode.current stop the process
    if (!rootNode.current) return;

    //  Initiate the rootNode
    rootNode.current.innerHTML = '';

    // Share the selected catalysts with the Table as SelectedIndices
    const handleSelectedIndicesChange = () => {
      const rectangulars = source.selected.indices;
      const selectedCatalystIndices = rectangulars.map(indeice => Math.floor(indeice / xTickLabels.length))
      const uniqueIndices = [...new Set(selectedCatalystIndices)];
      const selectedCatalysts = uniqueIndices.map(indice => yTickLabels[indice])
      const Indices = selectedCatalysts.map(cat => dfData.Catalyst.indexOf(cat))
      if (onSelectedIndicesChange && !deepEqual(lastIndices, uniqueIndices)) {
        onSelectedIndicesChange(Indices);
        setLastIndices(uniqueIndices);
      }
    }

    let colors = internalOptions.colors;
    if(!colors){
      colors = (cmMax[internalOptions.colorMap] != undefined) ? allPal[internalOptions.colorMap+cmMax[internalOptions.colorMap]] : allPal[defaultOptions.colorMap+cmMax[defaultOptions.colorMap]];
    }

    const colMapMinMax = internalOptions.colorMapperMinMax ? internalOptions.colorMapperMinMax : [Math.min(...(internalData["heatVal"])), Math.max(...(internalData["heatVal"]))];
    var mapper = new Bokeh.LinearColorMapper({palette: colors, low: colMapMinMax[0], high: colMapMinMax[1]});

    // Create the columnDataSource with position and value of recutangular
    const source = new Bokeh.ColumnDataSource({
      data: {
        xData: internalData['xData'].map(x => x + 1/2),
        yData: internalData['yData'].map(y => y + 1/2),
        heatVal: internalData['heatVal'],
        x0: internalData['xData'].map(x => 0),
        y0: internalData['yData'].map(y => 0),
        catalyst: internalData['yData'].map(y => [...internalData["yTicks"]][y] )
      }
    });

    // Select all rectangles to highlight based on SelectedIndices
    const selected = [];
    const catalysts = selectedIndices.map(i => dfData.Catalyst[i]);
    const firstIndices = catalysts.map(indice => yTickLabels.indexOf(indice));

    for (let i = 0; i < yTickLabels.length; i++) {
      if(firstIndices.includes(i)){
        for (let j = 0; j < xTickLabels.length; j++) {
          selected.push(i * xTickLabels.length + j);
        }
      }
    }

    source.selected.indices = [...selected];

    // When the recutangular were selected, execute the handleSelectedIndicesChange to midify selectedIndices
    source.connect(source.selected.change, () => handleSelectedIndicesChange());

    const similarGeneSource =markerMaker(dfData, rootCatalyst, similarDistance, minY, maxY, minX, maxX, yTickLabels)

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
    

    // When user Hover the mouse on rectangular, catalyst name and heatVale will be shown
    let activeToolTipTitles = internalOptions.toolTipTitles || defaultOptions.toolTipTitles;
    const tooltip = [[activeToolTipTitles[0], '@'+"catalyst"],[activeToolTipTitles[1], '@'+"heatVal"],]
    plot.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [renderer] }));

    // Creat the color bar
    const color_bar = new Bokeh.ColorBar({
      color_mapper: mapper,
      major_label_text_font_size: internalOptions.fontSize || defaultOptions.fontSize,
      ticker: new Bokeh.BasicTicker({desired_num_ticks: colors.length}),
      formatter: new Bokeh.PrintfTickFormatter({format: "%f"+(internalOptions.heatValUnit || defaultOptions.heatValUnit)}),
      label_standoff: 6,
      border_line_color: null
    });
    
    // Show the area name on xTickLabel
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

    // Show the columns name on xTickLabel
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

    // Show catalyst name on yTickLabel
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

  }, [data, isXlabelArea, selectedIndices, similarDistance])

  return(
    <div id="containerHolder">
      <button
        onClick={() => {
          setIsXlabelArea(!isXlabelArea);
          }
        }
      >{buttonWords}
      </button>
      <DelayedTooltip 
        similarDistance={similarDistance} 
        setSimilarDistance={setSimilarDistance} 
        maxDistance={maxDistance} 
      />
      <div ref={rootNode} />
    </div>
  );
}

//----------------------------------------------------------------------------------------------
//  A function to visualize the Area plot
//---------------------------------------------------------------------------------------
function AreaPlot({
  data,
  options,
  selectedIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const parallelData = data.parallelData;
  const xTickLabels = Object.keys(data.dfDistanceIntroduced).filter(key => key.includes("area"));
  const columnsForGene = data.columnsForGene;
  const rootCatalyst = data["rootCatalyst"];
  const xAxisRange = parallelData[rootCatalyst].length;
  const yMin = Math.min(...Object.values(parallelData).map(line => Math.min(...line)));
  const yMax = Math.max(...Object.values(parallelData).map(line => Math.max(...line)));
  const yRangeMin = yMin < 0 ? yMin * 1.1 : -xAxisRange / 100;
  const yAxisRange = yMax - yMin;
  const xTickPoints = Array.from({ length: parallelData[rootCatalyst].length }, (_, index) => index + 1 / 2);
  const xLabelPoints = Array.from({ length: columnsForGene.length }, (_, index) => index );

  const { extent, margin } = internalOptions;
  const { width,height } = extent;
  console.log(data)
  const { l: left, r: right, t: top, b: bottom } = margin;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xRange = new Bokeh.Range1d({ start: 0, end: xAxisRange  });
  const yRange = new Bokeh.Range1d({ start: yRangeMin, end: yMax * 1.1 });

  const rootNode = useRef(null);
  const [isXlabelArea, setIsXlabelArea] = useState(true);

  useEffect(() => {
    //  If there is not a rootNode.current stop the process
    if (!rootNode.current) return;

    //  Initiate the rootNode
    rootNode.current.innerHTML = '';

    // Crate the canvas to draw graph
    const plot = new Bokeh.Plotting.figure({
      tools: internalOptions.tools,
      width: plotWidth,
      height: plotHeight,
      x_range: xRange,
      y_range: yRange,
    });



    // Creat white back ground
    const backGroundSource = new Bokeh.ColumnDataSource({
      data: {
        xData: [xAxisRange / 2],
        yData: [(yMax + yRangeMin)/ 2],
      }
    });

    // Make the vack ground color white
    const renderer = plot.rect({
      x: { field: "xData" },
      y: { field: "yData" },
      width: xAxisRange,
      height: yAxisRange,
      source: backGroundSource,
      fill_color: "white"
    });
    
    // Create 15 holizon lines 
    const holizonLInes = Array.from({length:15},(_, index) => (index * yAxisRange / 15 + yMin))

    const holizonSource = new Bokeh.ColumnDataSource({
      data:{
        x0: holizonLInes.map(p => 0),
        y0: holizonLInes.map(p => p),
        x1: holizonLInes.map(p => xAxisRange),
        y1: holizonLInes.map(p => p),
      }
    });

    // Show 15 holizon lines
    const holizonDraw = plot.segment(
      {field:"x0"},
      {field:"y0"},
      {field:"x1"},
      {field:"y1"},
      {source : holizonSource}
    );   

    // Create 15 alphabet characters and determin the position to put
    const labelSource = new Bokeh.ColumnDataSource({
      data:{
        xData: holizonLInes.map(p =>1 / 4),
        yData: holizonLInes.map(p => p),
        labels: Array.from(Array(15), (_, i) => String.fromCharCode(i + 65))
      }
    });

    // Put 15 characters
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

    // Creat columnDataSource and draw line for all lines 
    Object.keys(parallelData).forEach(catalyst => {
      const yData = parallelData[catalyst].map(y => y );
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

    Bokeh.Plotting.show(plot, rootNode.current);

  }, [parallelData, isXlabelArea])

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

//----------------------------------------------------------------------------------------------
//  A function that returns suggestions for common patterns and a DataFrame containing the Catalyst gene and edit_distance.
//---------------------------------------------------------------------------------------
function GeneTable({
  data,
  options,
  colorTags,
  selectedIndices,
  filteredIndices,
  onSelectedIndicesChange,
  colorMap
}){
  const internalOptions = Object.assign({}, defaultOptions, options);
  const internalData = data;
  const dfData = internalData.dfDistanceIntroduced;
  const xTickLabels = Object.keys(data.areaData);

  const { extent, margin } = internalOptions;
  const { width,height } = extent;
  
  const rootNode = useRef(null);
  const [lastIndices, setLastIndices] = useState([...selectedIndices])
  const [isPatternData, setIsPatternData] = useState(false)
  const [similarDistance, setSimilarDistance] = useState(0);

  useEffect(() => {
    //  If there is not a rootNode.current stop the process
    if (!rootNode.current) return;

    //  Initiate the rootNode
    rootNode.current.innerHTML = '';

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

    if(!isPatternData){
      // return dataframe
      const handleSelectedIndicesChange = () => {
        const indices = tableSource.selected.indices;
        if (onSelectedIndicesChange && !deepEqual(lastIndices, indices)) {
          onSelectedIndicesChange(indices);
          setLastIndices([...indices]);
        }
      }

      const colNamesInProperOrder = Object.keys(dfData);

      const tableSource = new Bokeh.ColumnDataSource({ data: dfData });

      tableSource.selected.indices = [...selectedIndices];
      tableSource.connect(tableSource.selected.change, () => handleSelectedIndicesChange());

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

    }else{
      // common pattern
      const patternData = internalData.patternCounts[similarDistance];
      const tableSource = new Bokeh.ColumnDataSource({ data: patternData });

      let displayColumns = Object.keys(patternData).map((v) => {
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
        width: width || defaultOptions.extent.width,
        height: height || defaultOptions.extent.height,
        selection_color: 'red',
      });

      Bokeh.Plotting.show(dataTable, rootNode.current);

    }

  }, [data, selectedIndices, isPatternData, similarDistance])

  const buttonWords = isPatternData? "Show dataFrame info" : "Show pattern info" 
  const maxDistance = Math.max(...dfData.distance);

  return(
    <div id="containerHolder">
      <button
        onClick={() => {
          setIsPatternData(!isPatternData);
          }
        }
      >{buttonWords}
      </button>
      {isPatternData && <DelayedTooltip 
        similarDistance={similarDistance} 
        setSimilarDistance={setSimilarDistance} 
        maxDistance={maxDistance} 
      />}
      <div ref={rootNode} />
    </div>
  );
}

//----------------------------------------------------------------------------------------------
//  A function to draw empty graph before configure and after data changed.
//---------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------------
//  A function to choose the visComp based on setting
//---------------------------------------------------------------------------------------
function componentSelector(data, dataChanged){
  const columnNumber = (data && data.scaledData) ? Object.keys(data.scaledData).length : 0;
  const visualization = data && data["visualizationMethod"];
  if(dataChanged){
    return emptyCatalystGeneVC
  }else{
    if (columnNumber > 0 && visualization){
      if (visualization === "Hierarchical Clustering"){
        return Clustering;
      } else if (visualization === 'Heatmap'){
        return HeatMapGene;
      } else if (visualization === 'Area Plot'){
        return AreaPlot;
      } else{
        return GeneTable;
      }
    }
  }
  return emptyCatalystGeneVC
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
  const internalData = data
  const internalOptions = Object.assign({}, defaultOptions, options);
  const [currentDataSource, setCurrentDataSource] = useState({id: '', name: ''});
  const availableDataSources = useSelector((state) => state.dataSources);

  // detect the change of dataset
  const dataChanged = availableDataSources.selectedDataSource != currentDataSource.id ? true : false;

  const SelComp = componentSelector(internalData, dataChanged)

  const params = { data, mappings, options, colorTags, selectedIndices, filteredIndices, onSelectedIndicesChange,}

  useEffect(() => {
    if(data && data.resetRequest){
      internalOptions.title = "EMPTY CUSTOM COMPONENT";
      delete data.resetRequest;
    }
    try {
      if (dataChanged) {
        setCurrentDataSource({id: availableDataSources.selectedDataSource, name: (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id).name)})
      }
    } catch (error) { /*Just ignore and move on*/ }
  }, [data]);

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

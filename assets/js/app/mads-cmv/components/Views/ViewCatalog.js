/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Catalog of all available Views and their initial default settings.
// ------------------------------------------------------------------------------------------------
// Notes: 'ViewCatalog' provide the Visualisation page with information about each available Views
//        and visualization component. All Views in the catalog will be displayed in the Add View
//        Dropdown options.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal PieChart & PieForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------

// Visualization
import TableView from './Table';
import ScatterView from './Scatter';
import BarView from './Bar';
import PieView from './Pie';
import Scatter3DView from './Scatter3D';
import GapMinderView from './GapMinder';
import LineView from './Line';

// Data Processing
import ImageViewView from './ImageView';

// Analysis
import ParCoordsView from './ParCoordsView';
import HistView from './Hist';
import RFFeatureView from './RFFeature';
import ClusteringView from './Clustering';
import HeatMapView from './HeatMap';
import PairwiseCorrelationView from './PairwiseCorrelation';
import NodeGraphView from './NodeGraphView';

// Machine Learning
import RegressionView from './Regression';
import ClassificationView from './Classification';
import TensorFlowView from './TensorFlow';
import GaussianProcessView from './GaussianProcess';

// Static Data Visual Support
import PeriodicTableView from './PeriodicTable';
import Molecule3DView from './Molecule3D';
import StatisticsView from './Statistics';

// Other
import CustomView from './Custom';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Catalog Config
//-------------------------------------------------------------------------------------------------
const config = [

  // VISUALIZATION CATEGORY
  //=======================

  // Table - A Customizable Data Table
  //------------------------------------------
  {
    type: 'table',
    name: 'Table',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: TableView,
    settings: {
      columns: [],
      options: {
        extent: {
          width: 800,
          height: 400,
        },
      },
    },
  },
  //------------------------------------------

  // Scatter - A Customizable Scatter Plot
  //------------------------------------------
  {
    type: 'scatter',
    name: 'Scatter',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: ScatterView,
    settings: {
      options: {
        extent: {
          width: 400,
          height: 400,
        },
      },
    },
  },
  //------------------------------------------

  // Bar - A Customizable Bar Chart
  //------------------------------------------
  {
    type: 'bar',
    name: 'Bar',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: BarView,
    settings: {
      options: {
        extent: {
          width: 400,
          height: 400,
        },
        colorMap: 'Category10',
        legendLocation: 'top_right',
      },
      mappings: {},
    },
  },
  //------------------------------------------

  // Pie - A Customizable Pie Chart
  //------------------------------------------
  {
    type: 'pie',
    name: 'Pie',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: PieView,
    settings: {
      bins: 7,
      options: {
        colorMap: 'Category20c',
        extent: {
          width: 0,
          height: 0,
        },
      }
    },
  },
  //------------------------------------------

  // Scatter 3D - A 3-dimensional Scatter Plot
  //------------------------------------------
  {
    type: 'scatter3D',
    name: 'Scatter3D',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: Scatter3DView,
    settings: {
      method: "Manual",
      options: {
        axisTitles: ['x', 'y', 'z'],
        marker: {
          size: 2,
          color: 'red',
          opacity: 0.8,
        },
        colorMap: 'Category20c',
        extent: { width: 450, height: 450 },
        camera: {
          eye: {x: 1.25, y: 1.25, z: 1.25},
          up: {x: 0, y: 0, z: 1},
          center: {x: 0, y: 0, z: 0},
        },
      }
    },
  },
  //------------------------------------------

  // Line - A Customizable Line Chart
  //------------------------------------------
  {
    type: 'line',
    name: 'Line',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: LineView,
    settings: {
      options: {
        extent: {
          width: 700,
          height: 400,
        },
        XAxisLabel: "",
        YAxisLabel: "",
        legendLabel: "",
        colorMap: 'Category10',
      },
      mappings: {},
    },
  },
  //------------------------------------------

  // GapMinder - A Hans Rosling Inspiration
  // COMMENTED OUT SINCE IT IS NOT YET FINISHED AT ALL
  //------------------------------------------
  // {
  //   type: 'gapminder',
  //   name: 'GapMinder',
  //   category: 'Visualization',
  //   version: 0.2,
  //   devStage: "Alfa Draft",
  //   component: GapMinderView,
  //   settings: {
  //     options: {
  //       axisTitles: ['x', 'y'],
  //       marker: {
  //         size: 2,
  //         color: 'red',
  //         opacity: 0.8,
  //       },
  //       colorMap: 'Category20c',
  //       extent: { width: 450, height: 450 },
  //     }
  //   },
  // },
  //------------------------------------------


  // DATA PROCESSING CATEGORY
  //=========================

  // Image View - A Customizable Image Viewer & Processer
  //-----------------------------------------------------
  {
    type: 'imageView',
    name: 'ImageView',
    category: 'Data Processing',
    version: 1.0,
    devStage: "Stable Release",
    component: ImageViewView,
    customBtns: [
      {name: 'saveImg', icon: 'save', text: 'Save Image'},
      {name: 'annotateImg', icon: 'edit', text: 'Enable Annotate Image'},
      {name: 'annotateBrushType', type: 'list', text: 'Pen or Eraser?', options: [{key: "Pen0", text:"Pen", value: 0}, {key: "Eraser1", text:"Eraser", value: 1}]},
      {name: 'annotationColor', type: 'color', text: 'Annotation Color'},
      {name: 'annotationSize', type: 'number', step: 1, defVal: 2, text: 'Annotation Brush Size'},
      {name: 'annotationOpacity', type: 'number', step: 0.1, min: 0.1, max: 1.0, defVal: 1.0, text: 'Annotation Brush Opacity'},
      {name: 'annotateImgReset', icon: 'trash', text: 'Reset All Annotations'},
    ],
    settings: {
      options: {
        title: "",
        caption: "",
        extent: {
          width: 400,
          height: 300,
        },
        border: {
          color: "black",
          style: "solid",
          size: 2,
        },
        cssFilters: {
          isEnabled: false,
          grayscaleVal: 0,
          blurVal: 0,
          brightnessVal: 100,
          contrastVal: 100,
          hueRotateVal: 0,
          invertVal: 0,
          opacityVal: 100,
          saturateVal: 100,
          sepiaVal: 0,
        },
        skImg: {
          isEnabled: false,
          applyToCurrentEnable: false,
          grayscaleEnabled: false,
          rotateEnabled: false,
          edgeDetectEnabled: false,
          colorTintEnabled: false,
          invertEnabled: false,
          gammaChangeEnabled: false,
          enhanceContrastEnabled: false,
          sharpenEnabled: false,
          denoiseEnabled: false,
          erosionEnabled: false,
          hueSatValEnabled: false,
          regionMaxFilterEnabled: false,
          convexHullEnabled: false,
          ridgeDetectionEnabled: false,
          swirlEnabled: false,
          ragThresholdEnabled: false,
          thresholdingEnabled: false,
          CVSegmentationEnabled: false,
          switchColorEnabled: false,
          flipEnabled: false,
          circleFrameEnabled: false,
          circleFrameCenterH: -1,
          circleFrameCenterV: -1,
          circleFrameRadius: -1,
          skeletonizeEnabled: false,
          objectDetectionEnabled: false,
          contourFindingEnabled: false,
          florescentColorsEnabled: false,
        },
        annotation: [],
      },
    },
  },
  //------------------------------------------


  // ANALYSIS CATEGORY
  //==================

  // Parallel Coordinates - A Customizable Parallel Coordinate Component
  //------------------------------------------
  {
    type: 'parcoords',
    name: 'Parallel Coordinates',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: ParCoordsView,
    settings: {
      axes: [],
      options: {
        extent: { width: 500, height: 300 },
      },
    },
  },
  //------------------------------------------

  // Histogram - A Customizable Histogram Bar Chart
  //------------------------------------------
  {
    type: 'histogram',
    name: 'Histogram',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: HistView,
    settings: {
      options: {
        extent: { width: 300, height: 300 },
      },
      bins: 10,
      mappings: {
        n: 'hist',
        bins: 'binEdges',
      },
    },
  },
  //------------------------------------------

  // Feature Importance (RF) - A Customizable Feature Importance Bart Chart
  //------------------------------------------
  {
    type: 'feature-importance',
    name: 'Feature Importance (RF)',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: RFFeatureView,
    settings: {
      featureColumns: [],
      targetColumn: '',
      mappings: {
        dimension: 'features',
        measures: ['importance'],
      },
    },
  },
  //------------------------------------------

  // Heatmap - A Customizable Heatmap View
  //------------------------------------------
  {
    type: 'heatmap',
    name: 'HeatMap',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: HeatMapView,
    settings: {
      options: {
        colorMap: 'Magma',
        extent: {
          width: 500,
          height: 400,
        },
      }
    },
  },
  //------------------------------------------

  // Pairwise Correlation - A Customizable Pairwise Correlation (heatmap) component
  //------------------------------------------
  {
    type: 'pairwise-correlation',
    name: 'PairwiseCorrelation',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: PairwiseCorrelationView,
    settings: {
      options: {
        title: "Pairwise Correlation",
        extent: { width: 600, height: 600 },
        maskEnabled: true,
      }
    },
  },
  //------------------------------------------

  // Node Graph - A Customizable Node Graph Viewer
  //------------------------------------------
  {
    type: 'nodeGraph',
    name: 'NodeGraph',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: NodeGraphView,
    customBtns: [
      {name: 'toggleNodeResettling', icon: 'recycle', text: 'Toggle Node Pinning'},
      {name: 'toggleNodeLabels', icon: 'square', text: 'Toggle Node Labels'},
      {name: 'toggleLinkLabels', icon: 'connectdevelop', text: 'Toggle Link Labels'},
    ],
    settings: {
      options: {
        links: {},
        graphLayout: {},
        nodes: {},
        extent: {
          width: 700,
          height: 600,
        },
        bkgCol: "#ffffff",
        txtCol: "#000000",
      },
    },
  },
  //------------------------------------------

  // MACHINE LEARNING CATEGORY
  //==========================

  // Regression - A Customizable Regression Scatter Line Plot
  //------------------------------------------
  {
    type: 'regression',
    name: 'Regression',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: RegressionView,
    settings: {
      method: 'Linear',
      methodArguments: {
        arg1: 0,
        arg2: 0
      },
      featureColumns: [],
      targetColumn: '',
      cvmethod: "TrainTestSplit",
      cvmethodArg: 0.2,
      mappings: {},
    },
  },
  //------------------------------------------

  // Classification - A Customizable Classification Scatter Line Plot
  //------------------------------------------
  {
    type: 'classification',
    name: 'Classification',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: ClassificationView,
    settings: {
      method: 'RandomForest',
      methodArguments: {
        arg1: 0,
        arg2: 100
      },
      featureColumns: [],
      targetColumn: '',
      mappings: {},
    },
  },
  //------------------------------------------

  // Clustering - A Customizable Clustering Bar Chart
  //------------------------------------------
  {
    type: 'clustering',
    name: 'K-Means Clustering',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: ClusteringView,
    settings: {
      method: 'KMeans',
      numberOfClusters: 3,
      featureColumns: [],
      mappings: {
        dimension: 'cids',
        measures: ['counts'],
      },
    },
  },
  //------------------------------------------

  // Gaussian Process - A 3-dimensional Scatter Plot
  //------------------------------------------
  {
    type: 'gaussianProcess',
    name: 'Gaussian Process',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: GaussianProcessView,
    settings: {
      featureColumns: [],
      targetColumn: '',
      kernel: '',
      options: {
        colorMap: 'Category20c',
        extent: { width: 450, height: 450 },
        camera: {
          eye: {x: 1.25, y: 1.25, z: 1.25},
          up: {x: 0, y: 0, z: 1},
          center: {x: 0, y: 0, z: 0},
        },
      }
    },
  },
  //------------------------------------------

  // Statistics - A Customizable Statistics View
  //-----------------------------------------------
  {
    type: 'statistics',
    name: 'Statistics',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: StatisticsView,
    settings: {
      featureColumns: [],
      options: {
        extent: {
          width: 800,
          height: 230,
        },
      },
    },
  },

  // TensorFlow View - A Customizable TensorFlow ML Component
  // COMMENTED OUT SINCE IT IS NOT YET FINISHED AT ALL
  //------------------------------------------
  // {
  //   type: 'tensorflow',
  //   name: 'TensorFlow',
  //   category: 'Machine Learning',
  //   version: 0.2,
  //   devStage: "Alfa Draft",
  //   component: TensorFlowView,
  //   // customBtns: [
  //   //   {name: 'saveImg', icon: 'save', text: 'Save Image'},
  //   //   {name: 'annotateImg', icon: 'edit', text: 'Enable Annotate Image'},
  //   //   {name: 'annotateBrushType', type: 'list', text: 'Pen or Eraser?', options: [{key: "Pen0", text:"Pen", value: 0}, {key: "Eraser1", text:"Eraser", value: 1}]},
  //   //   {name: 'annotationColor', type: 'color', text: 'Annotation Color'},
  //   //   {name: 'annotationSize', type: 'number', step: 1, defVal: 2, text: 'Annotation Brush Size'},
  //   //   {name: 'annotationOpacity', type: 'number', step: 0.1, min: 0.1, max: 1.0, defVal: 1.0, text: 'Annotation Brush Opacity'},
  //   //   {name: 'annotateImgReset', icon: 'trash', text: 'Reset All Annotations'},
  //   // ],
  //   settings: {
  //     options: {
  //       title: "",
  //       extent: {
  //         width: 400,
  //         height: 300,
  //       },
  //       border: {
  //         color: "black",
  //         style: "solid",
  //         size: 2,
  //       },
  //     },
  //   },
  // },
  //------------------------------------------


  // STATIC DATA VISUAL SUPPORT CATEGORY
  //====================================

  // Periodic Table - A Non-Customizable Chemical Elements Periodic Table
  //------------------------------------------
  {
    type: 'periodic-table',
    name: 'Periodic Table',
    category: 'Static Data Visual Support',
    version: 1.0,
    devStage: "Stable Release",
    component: PeriodicTableView,
    settings: {
      columns: [],
    },
    rglRules : {isResizable: false},
  },
  //------------------------------------------

  // Molecule 3D - A Customizable 3D Molecule Viewer
  //------------------------------------------
  {
    type: 'molecule3D',
    name: 'Molecule3D',
    category: 'Static Data Visual Support',
    version: 1.0,
    devStage: "Stable Release",
    component: Molecule3DView,
    settings: {
      options: {
        extent: {
          width: 500,
          height: 400,
        },
        bkgCol: "#ffffff",
        txtCol: "#000000",
      },
    },
  },
  //------------------------------------------


  // OTHER CATEGORY
  //===============

  //------------------------------------------
  // Custom - A collection of all VisComps that can be added via a smart 'Wizard'-form
  // IT IS NOT YET FINISHED AND/OR FULLY IMPLEMENTED, THEREFORE IT IS COMMENTED OUT
  //------------------------------------------
  // {
  //   type: 'custom',
  //   name: 'Custom',
  //   category: 'Other',
  //   version: 0.1,
  //   devStage: "Draft",
  //   component: CustomView,
  //   settings: {
  //     options: {
  //       extent: {
  //         width: 400,
  //         height: 400,
  //       },
  //     },
  //   },
  // },
  //------------------------------------------
];
//-------------------------------------------------------------------------------------------------
export default config;

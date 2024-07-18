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
import TableView from './TableView';
import ScatterView from './ScatterView';
import BarView from './BarView';
import PieView from './PieView';
import Scatter3DView from './Scatter3DView';
import LineView from './LineView';
import ViolinPlotView from './ViolinPlotView';
import GapMinderView from './GapMinderView';

// Data Processing
import ImageViewView from './ImageView';
import FeatureEngineeringView from './FeatureEngineeringView';
import MonteCatView from './MonteCatView';
import CatalystPropertyConversionView from './CatalystPropertyConversionView';

// Analysis
import ParCoordsView from './ParCoordsView';
import HistView from './HistView';
import RFFeatureView from './RFFeatureView';
import ClusteringView from './ClusteringView';
import HeatMapView from './HeatMapView';
import PairwiseCorrelationView from './PairwiseCorrelationView';
import NodeGraphView from './NodeGraphView';

// Machine Learning
import RegressionView from './RegressionView';
import ClassificationView from './ClassificationView';
import TensorFlowView from './TensorFlowView';
import GaussianProcessView from './GaussianProcessView';

// Static Data Visual Support
import PeriodicTableView from './PeriodicTableView';
import Molecule3DView from './Molecule3DView';
import StatisticsView from './StatisticsView';

// Other
import CadsiesView from './CadsiesView.js';
import CustomView from './CustomView';

// Template
import Cads_Component_TemplateView from './Cads_Component_TemplateView.js';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Special Settings for controlling component access
//-------------------------------------------------------------------------------------------------
export const specialPass = ['micke.kuwahara@gmail.com', 'micke.kuwahara@sci.hokudai.ac.jp', 'keisuke.takahashi@sci.hokudai.ac.jp', 'lauren.takahashi@sci.hokudai.ac.jp'];
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Catalog Config
//-------------------------------------------------------------------------------------------------
export const config = [

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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
  },
  //------------------------------------------


  // Violin Plot - A Customizable Violin Plot
  //------------------------------------------
  {
    type: 'violinPlot',
    name: 'Violin Plot',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: ViolinPlotView,
    settings: {
      options: {
        title: "Violin Plot",
        extent: {
          width: 700,
          height: 400,
        },
        colorMap: 'Category10',
      },
      // mappings: {},
    },
    enabled: true,
  },
  //------------------------------------------

  // GapMinder - A Hans Rosling Inspiration
  // NOT YET FINISHED AT ALL
  //------------------------------------------
  {
    type: 'gapminder',
    name: 'GapMinder',
    category: 'Visualization',
    version: 0.2,
    devStage: "Alfa Teaser",
    component: GapMinderView,
    settings: {
      options: {
        requiredFields: ['year', 'country'],
        extent: { width: 900, height: 600 },
      },
    },
    enabled: true,
  },
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
    enabled: true,
  },
  //------------------------------------------

  // Feature Engineering - A Customizable Feature Engienering
  //----------------------------------------------------------------
  {
    type: 'featureEngineering',
    name: 'FeatureEngineering',
    category: 'Data Processing',
    version: 0.1,
    devStage: "Stable Release",
    component: FeatureEngineeringView,
    customBtns: [
      {name: 'inputcsvfile', icon: 'file image', text: 'Input CSV File Data Requirements Format. Click here. '},
      {name: 'outputcsvfile', icon: 'file image outline', text: 'Output CSV File Data Format. Click here'},
    ],
    settings: {
      selectedDataSource: 'Data Management',
      propertyConversionDS: {},
      propertyConversionId: '',
      descriptorColumns: [],
      targetColumns: [],
      firstOrderDescriptors: [],
      options: {
        extent: {
          width: 400,
          height: 200,
        },
      },
    },
    enabled: true,
  },
  //------------------------------------------

  // THIS IS A Monte Cat COMPONENT FOR COPYING WHEN CREATING NEW ONES
  //----------------------------------------------------------------
  {
    type: 'monteCat',
    name: 'MonteCat',
    category: 'Data Processing',
    version: 0.1,
    devStage: "Stable Release",
    component: MonteCatView,
    customBtns: [
      {name: 'inputcsvfile', icon: 'file image', text: 'Input CSV File Data Requirements Format. Click here. '},
      {name: 'outputcsvfile', icon: 'file image outline', text: 'Output CSV File Data Format. Click here'},
      {name: 'paperLink', icon: 'linkify', text: 'Learn more about montecat.'},
    ],
    settings: {
      selectedDataSource: 'Data Management',
      baseDescriptors: [],
      featureEngineeringDS: {},
      featureEngineeringId: '',
      featureEngineeringTC: [],
      machineLearningModel: '',
      temperature: 0,
      targetColumn: '',
      descriptorsFileName: "Nothing loaded.",
      randomSeed: false,
      options: {
        extent: {
          width: 400,
          height: 200,
        },
      },
    },
    enabled: true,
  },
  //------------------------------------------

  // THIS IS A Catalyst Property Conversion COMPONENT FOR COPYING WHEN CREATING NEW ONES
  //----------------------------------------------------------------
  {
    type: 'catalystPropertyConversion',
    name: 'CatalystPropertyConversion',
    category: 'Data Processing',
    version: 0.1,
    devStage: "Stable Release",
    component: CatalystPropertyConversionView ,
    customBtns: [
      {name: 'inputcsvfile', icon: 'file image', text: 'Input CSV File Data Requirements Format. Click here. '},
      {name: 'outputcsvfile', icon: 'file image outline', text: 'Output CSV File Data Format. Click here'},
    ],
    settings: {
      conversionMethod: '',
      catalyst: [],
      targetColumns: [],
      compositionColumns: [],
      options: {
        extent: {
          width: 400,
          height: 300,
        },
      },
    },
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    customBtns: [
      {name: 'saveCSVData', icon: 'download', text: 'Download Data as CSV'},
    ],
    settings: {
      featureColumns: [],
      options: {
        extent: {
          width: 800,
          height: 230,
        },
      },
    },
    enabled: true,
  },

  // TensorFlow View - A Customizable TensorFlow ML Component
  // NOT YET FINISHED AT ALL
  //------------------------------------------
  {
    type: 'tensorflow',
    name: 'TensorFlow',
    category: 'Machine Learning',
    version: 0.3,
    devStage: "Alfa Teaser",
    component: TensorFlowView,
    settings: {
      options: {
        title: "",
        extent: {
          width: 400,
          height: 300,
        },
      },
    },
    enabled: true,
  },
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
    enabled: true,
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
    enabled: true,
  },
  //------------------------------------------


  // OTHER CATEGORY
  //===============

  // Cadsies - A customizable Mini Web App System
  // IT IS NOT YET FINISHED AND/OR FULLY IMPLEMENTED
  //------------------------------------------
  {
    type: 'cadsies',
    name: 'CADS Custom Mini App',
    category: 'Other',
    version: 0.1,
    devStage: "Draft",
    component: CadsiesView,
    settings: {
      options: {
        extent: {
          width: 98,
          height: 68,
        },
        extentUnit: {
          width: 'vw',
          height: 'vh',
        },
        ws: "",
      },
    },
    enabled: false,
  },
  //------------------------------------------

  // Custom - A collection of all VisComps that can be added via a smart 'Wizard'-form
  // IT IS NOT YET FINISHED AND/OR FULLY IMPLEMENTED
  //------------------------------------------
  {
    type: 'custom',
    name: 'Custom',
    category: 'Other',
    version: 0.1,
    devStage: "Draft",
    component: CustomView,
    settings: {
      options: {
        extent: {
          width: 400,
          height: 400,
        },
      },
    },
    enabled: false,
  },
  //------------------------------------------


  // TEMPLATE (Not for production use, development only)
  //===============

  // THIS IS A TEMPLATE COMPONENT FOR COPYING WHEN CREATING NEW ONES
  //----------------------------------------------------------------
  {
    type: 'cads_component_template',
    name: 'Cads_Component_Template',
    category: 'Template',
    version: 0.1,
    devStage: "Draft",
    component: Cads_Component_TemplateView,
    settings: {
      options: {
        extent: {
          width: 400,
          height: 400,
        },
      },
    },
    enabled: true,
  },
  //------------------------------------------
];
//-------------------------------------------------------------------------------------------------
// export default config;

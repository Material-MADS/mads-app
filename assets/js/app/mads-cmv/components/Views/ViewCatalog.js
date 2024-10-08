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
import featureAssignmentView from './FeatureAssignmentView';

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
// COMPONENT CONFIGURATION INSTRUCTIONS
//-------------------------------------------------------------------------------------------------
// type: [Mandatory] The name which this component is identified by on the server side (processor.py)
// name: [Mandatory] The name that is displayed to the user
// category: [Optional] Grouping of components. if left out, 'Undefined' is assigned, any value is possible but current in use are {'Visualization','Data Processing','Analysis','Machine Learning','Static Data Visual Support','Other','Template'}
//           The developer should also place the component configuration json in its right place in this file for good overview and because the categories will appear in the same order they are first found and created (Not aphabetically)
// version: [Optional] any numerical string value to indicate for the developer and the user what version this component are at. Any value different than 1.0 will be displayed
// devStage: [Optional] Any value or no value beside 'Stable Release' will generate a warning popup that the component is under development. Beside that any string will work, depending on what the developer wants to communicate,
// description: [Optional] Some basic info about what this component basically can do and offer
// devInfo: [Optional] An array of objects containing name, affiliation and URL-link about the developer(s), [{name: "", affiliation: "", link: ""}]. Will appear in an 'About' modal accessed via the (i) symbol in the top right corner of the component
// supervisors: [Optional] An array of objects containing name, affiliation and URL-link about the supervising and support staff, that provided help during the development of this component, [{name: "", affiliation: "", link: ""}]. Will appear in an 'About' modal accessed via the (i) symbol in the top right corner of the component if it exists
// academicInfo: [Optional] An array of objects containing title and URL-link about any academic papers related to the component, [{title: "", link: ""}]. Will appear in an 'About' modal accessed via the (i) symbol in the top right corner of the component
// component: [Mandatory] The actual View object for the component, as imported at the top of this file. A must, or nothing will work.
// customBtns: [Optional] An array of custom buttons that will appear at the top of the component (default color yellow). These buttons are assigned behavior inside the component's Vis code.
//             {name: '', icon: '', text: ''} 'name' is the id found by code, 'icon' is the semantic-ui-react icon name that will be displayed on the button and 'text' is what the user will see when hovering the button
// settings: {            [Mandatory] any settings or options besides extent: {width, height} (initial size of the component (in pixels)) are optional and component based
//   options: {
//     extent: {
//       width: 400,
//       height: 300,
//     },
//   },
// },
// enabled: if true the component will appear for the user in the list of available components, if false it will be hidden and not available
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
    description: "This component is a basic table that gets filled by the current loaded data and allows various interaction.",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component provides a classic scatter plot with various ways to display the available data and to interact with the plot",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to display the active data as bar charts in many various ways",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    supervisors: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to manage data in such way that it be displayed as a Pie chart",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    supervisors: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to manage data in order to display it in a 3-dimensional Scatter plot chart",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component allows the user to manage data in order to display it in a line chart",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component allows the user to manage data in order to display it in a violin plot",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is attempting to display complex data in similar ways as the famous statistical web site GapMinder",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "The ImageView Component can do multiple forms of image processing using a range of algorithms and features from the SciKitImage python library and also CSS",
    devInfo: [{name: "Micke Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    academicInfo: [{title: "Improving scientific image processing accessibility through development of graphical user interfaces for scikit-image", link: "https://pubs.rsc.org/en/content/articlelanding/2023/dd/d3dd00061c"}],
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

  // Feature Assignment Conversion
  //----------------------------------------------------------------
  {
    type: 'featureAssignment',
    name: 'FeatureAssignment',
    category: 'Data Processing',
    version: 1.0,
    devStage: "Stable Release",
    description: "This component allows the user to assign features for machine learning",
    devInfo: [{name: "Yoshiki Hasukawa", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Yoshiki-Hasukawa"}],
    supervisors: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}, {name: "Fernando García Escobar", affiliation: "Hokkaido University", link: "https://scholar.google.com/citations?hl=en&user=QZUMe10AAAAJ"}, {name: "Prof. Keisuke Takahashi", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Keisuke-Takahashi-5"}],
    academicInfo: [{title: "Web based Graphical User Interface for Automated Materials Feature Engineering for Machine Learning", link: "https://placebear.com/200/300"}],
    component: featureAssignmentView,
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

  // Feature Engineering - A Customizable Feature Engienering
  //----------------------------------------------------------------
  {
    type: 'featureEngineering',
    name: 'FeatureEngineering',
    category: 'Data Processing',
    version: 1.0,
    devStage: "Stable Release",
    description: "This component allows the user to engineer features used in machine learning",
    devInfo: [{name: "Yoshiki Hasukawa", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Yoshiki-Hasukawa"}],
    supervisors: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}, {name: "Fernando García Escobar", affiliation: "Hokkaido University", link: "https://scholar.google.com/citations?hl=en&user=QZUMe10AAAAJ"}, {name: "Prof. Keisuke Takahashi", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Keisuke-Takahashi-5"}],
    academicInfo: [{title: "Web based Graphical User Interface for Automated Materials Feature Engineering for Machine Learning", link: "https://placebear.com/200/300"}],
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
    version: 1.0,
    devStage: "Stable Release",
    description: "The MonteCat Component carries out an automated Descriptor search using successive randomized Additions and Removals, selecting Descriptors that lead to a high model Score through the Metropolis-Hastings algorithm.",
    devInfo: [{name: "Yoshiki Hasukawa", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Yoshiki-Hasukawa"}],
    supervisors: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}, {name: "Fernando García Escobar", affiliation: "Hokkaido University", link: "https://scholar.google.com/citations?hl=en&user=QZUMe10AAAAJ"}, {name: "Prof. Keisuke Takahashi", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Keisuke-Takahashi-5"}],
    academicInfo: [{title: "MonteCat: A Basin-Hopping-Inspired Catalyst Descriptor Search Algorithm for Machine Learning Models", link: "https://pubs.acs.org/doi/full/10.1021/acs.jcim.3c01952"}, {title: "Web based Graphical User Interface for Automated Materials Feature Engineering for Machine Learning", link: "https://placebear.com/200/300"}],
    component: MonteCatView,
    customBtns: [
      {name: 'inputcsvfile', icon: 'file image', text: 'Input CSV File Data Requirements Format. Click here. '},
      {name: 'outputcsvfile', icon: 'file image outline', text: 'Output CSV File Data Format. Click here'},
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
    description: "This component allows the user to manage data in order to display and interact with it as a Parellel coordinates chart",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to manage data in order to display it as single or multiple histograms",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to apply Feature Importance algorithms on the current active data and display the results accordingly",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to manage data in order to display it in a heat map",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component allows the user to manage data in order to display it in a pairwise-correlation chart",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    supervisors: [{name: "Prof. Keisuke Takahashi", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Keisuke-Takahashi-5"}],
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
    description: "This component allows the user to manage node data in order to display it a highly interactive node graph",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    supervisors: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to apply regression algorithms on the current active data and then display the result accordingly",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to apply classification algorithms on the current active data and then display the result accordingly",
    devInfo: [{name: "Jun Fujima", affiliation: "Hokkaido University", link: "https://researchmap.jp/jjjjffff"}],
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
    description: "This component allows the user to apply clustering algorithms on the current active data and then display the result accordingly",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component allows the user to apply Gaussian Process Machine learning algorithms on the active current data and study, display and extract the results.",
    devInfo: [{name: "Yoshiki Hasukawa", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Yoshiki-Hasukawa"}],
    supervisors: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}, {name: "Prof. Keisuke Takahashi", affiliation: "Hokkaido University", link: "https://www.researchgate.net/profile/Keisuke-Takahashi-5"}],
    academicInfo: [{title: "Development of graphical user interface for design of experiments via Gaussian process regression and its case study", link: "https://www.researchgate.net/publication/377176967_Development_of_graphical_user_interface_for_design_of_experiments_via_Gaussian_process_regression_and_its_case_study"}],
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
    description: "This component allows the user to calculate and display some basic statistics for the current active data",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is an early version of a Tensorflow api component that allows to apply some tensorflow image recognition features inside CADS",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is a simple, slightly interactive, visualization of a periodic table and all its elements.",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is allowing the loading and displaying of chemical molecules in 3D view alongside various information on the molecule. The molecule can be interactively studied.",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is an early attempt at creating a new type of CADS component that allows for various new types of interaction and usage.",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is a non-finished attempt of creating a component that can morph into any other component... It is still under investigation if it fills any usefulness",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
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
    description: "This component is not a finished component, it is a template, that any developer building a new component should probably copy and start their development from for most convenience and ease.",
    devInfo: [{name: "Mikael Nicander Kuwahara", affiliation: "Hokkaido University", link: "https://researchmap.jp/kuwahara_micke?lang=en"}],
    // supervisors: [{name: "", affiliation: "", link: ""}],
    // academicInfo: [{title: "", link: ""}],
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

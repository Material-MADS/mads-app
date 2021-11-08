import ScatterView from './Scatter';
import BarView from './Bar';
import TableView from './Table';
import ParCoordsView from './ParCoordsView';
import HistView from './Hist';
import RFFeatureView from './RFFeature';
import ClusteringView from './Clustering';
import RegressionView from './Regression';
import ClassificationView from './Classification';
import PeriodicTableView from './PeriodicTable';
import PieView from './Pie';
import Scatter3DView from './Scatter3D';
import Molecule3DView from './Molecule3D';
import HeatMapView from './HeatMap';
import ImageViewView from './ImageView';
import CustomView from './Custom';


const config = [
  // Custom
  // {
  //   type: 'custom',
  //   name: 'Custom',
  //   category: 'Custom',
  //   version: 1.0,
  //   devStage: "Stable Release",
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



  // visualizations
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
  {
    type: 'bar',
    name: 'Bar',
    category: 'Visualization',
    version: 0.8,
    devStage: "Beta",
    component: BarView,
    settings: {
      options: {
        extent: {
          width: 400,
          height: 400,
        },
        colorMap: 'Category10',
      },
    },
  },
  {
    type: 'table',
    name: 'Table',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: TableView,
    settings: {
      columns: [],
      // selectionColor: 'orange',
      // nonselectionColor: `#${Greys9[3].toString(16)}`,
      // options: { extent: { width: 800, height: 400 } },
    },
  },
  {
    type: 'periodic-table',
    name: 'Periodic Table',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: PeriodicTableView,
    settings: {
      columns: [],
    },
  },
  {
    type: 'parcoords',
    name: 'Parallel Coordinates',
    category: 'Visualization',
    component: ParCoordsView,
    settings: {
      axes: [],
      // selectionColor: 'orange',
      // nonselectionColor: `#${Greys9[3].toString(16)}`,
      // options: { extent: { width: 800, height: 400 } },
    },
  },

  {
    type: 'molecule3D',
    name: 'Molecule3D',
    category: 'Visualization',
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
  {
    type: 'imageView',
    name: 'ImageView',
    category: 'Visualization',
    version: 1.0,
    devStage: "Stable Release",
    component: ImageViewView,
    settings: {
      options: {
        title: "",
        caption: "",
        extent: {
          width: 300,
          height: 300,
        },
        border: {
          color: "black",
          style: "solid",
          size: 2,
        }
      },
    },
  },

  // data processing

  // analysis
  {
    type: 'histogram',
    name: 'Histogram',
    category: 'Analysis',
    version: 1.0,
    devStage: "Stable Release",
    component: HistView,
    settings: {
      bins: 10,
      mappings: {
        n: 'hist',
        bins: 'binEdges',
      },
    },
  },
  {
    type: 'clustering',
    name: 'Clustering',
    category: 'Analysis',
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
  {
    type: 'pie',
    name: 'Pie',
    category: 'Analysis',
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
  {
    type: 'scatter3D',
    name: 'Scatter3D',
    category: 'Analysis',
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
  {
    type: 'heatmap',
    name: 'HeatMap',
    category: 'Analysis',
    version: 0.9,
    devStage: "Beta",
    component: HeatMapView,
    settings: {
      // bins: 5,
      options: {
        colorMap: 'Category10',
        extent: {
          width: undefined,
          height: 0,
        },
      }
    },
  },


  // machine learning
  {
    type: 'regression',
    name: 'Regression',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: RegressionView,
    settings: {
      method: 'Linear',
      featureColumns: [],
      targetColumn: '',
      folds: 5,
      mappings: {},
    },
  },
  {
    type: 'classification',
    name: 'Classification',
    category: 'Machine Learning',
    version: 1.0,
    devStage: "Stable Release",
    component: ClassificationView,
    settings: {
      method: 'RandomForest',
      featureColumns: [],
      targetColumn: '',
      mappings: {},
    },
  },
];

export default config;

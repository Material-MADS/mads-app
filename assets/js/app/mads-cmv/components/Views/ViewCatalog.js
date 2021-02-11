import ScatterView from './Scatter';
import BarView from './Bar';
import TableView from './Table';
import HistView from './Hist';
import RFFeatureView from './RFFeature';
import ClusteringView from './Clustering';
import RegressionView from './Regression';
import ClassificationView from './Classification';

const config = [
  // visualizations
  {
    type: 'scatter',
    name: 'Scatter',
    category: 'Visualization',
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
    type: 'table',
    name: 'Table',
    category: 'Visualization',
    component: TableView,
    settings: {
      columns: [],
      // selectionColor: 'orange',
      // nonselectionColor: `#${Greys9[3].toString(16)}`,
      // options: { extent: { width: 800, height: 400 } },
    },
  },

  // data processing

  // analysis
  {
    type: 'histogram',
    name: 'Histogram',
    category: 'Analysis',
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

  // machine learning
  {
    type: 'regression',
    name: 'Regression',
    category: 'Machine Learning',
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

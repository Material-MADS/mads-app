#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page providing access to all
#              available serverside components
# ------------------------------------------------------------------------------------------------
# Notes:  This is sort of the entry of the REST API parts of the 'analysis' interface of the
#         website that allows serverside work for the available components.
# ------------------------------------------------------------------------------------------------
# References: logging libs and all connected serverside available components
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from .histogram import get_histograms
from .feature_importance import get_feature_importance
from .clustering import get_clusters
from .regression import get_regression
from .classification import get_classification
from .pairwise_correlation import get_pairwise_correlation
from .pie import get_pie
from .scatter3D import get_scatter3D
from .statistics import get_statistics
from .custom import get_custom
from .scikit_image_manip import get_scikit_image_manip
from .node_graph import get_node_graph
from .gaussian_process import get_gaussian_process
from .cadsies import get_cadsies_stuff
from .network_analysis import get_network_analysis
from .feature_engineering import get_feature_engineering
from .monte_cat import get_monte_cat
from .feature_assignment import get_feature_assignment

from .cads_component_template import get_cads_component_template_stuff


import logging

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


processor_map = {
    'histogram': get_histograms,
    'feature-importance': get_feature_importance,
    'clustering': get_clusters,
    'regression': get_regression,
    'classification': get_classification,
    'pairwise-correlation': get_pairwise_correlation,
    'pie': get_pie,
    'scatter3D': get_scatter3D,
    'statistics': get_statistics,
    'custom': get_custom,
    'imageView': get_scikit_image_manip,
    'nodeGraph': get_node_graph,
    'gaussianProcess': get_gaussian_process,
    'cadsies': get_cadsies_stuff,
    'networkAnalysis': get_network_analysis,
    'featureEngineering': get_feature_engineering,
    'monteCat': get_monte_cat,
    'featureAssignment': get_feature_assignment,
    'cads_component_template': get_cads_component_template_stuff,
}


#-------------------------------------------------------------------------------------------------
def process_view(data):
    # logger.info(data['view']['type'])

    result = {'status': 'error: data is incorrect'}

    if data['view']['type'] == 'regression' or \
         data['view']['type'] == 'classification':
        result, _ = processor_map[data['view']['type']](data)
    else:
        result = processor_map[data['view']['type']](data)

    return result
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_model(data):
    # logger.info(data['view']['type'])

    _, model = processor_map[data['view']['type']](data)

    return model
#-------------------------------------------------------------------------------------------------

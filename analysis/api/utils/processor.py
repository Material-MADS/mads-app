from .histogram import get_histogram
from .feature_importance import get_feature_importance
from .clustering import get_clusters
from .regression import get_regression
from .classification import get_classification

import logging


logger = logging.getLogger(__name__)

processor_map = {
    'histogram': get_histogram,
    'feature-importance': get_feature_importance,
    'clustering': get_clusters,
    'regression': get_regression,
    'classification': get_classification,
}


def process_view(data):
    logger.info(data['view']['type'])

    result = {'status': 'error: data is incorrect'}

    if data['view']['type'] == 'regression' or \
         data['view']['type'] == 'classification':
        result, _ = processor_map[data['view']['type']](data)
    else:
        result = processor_map[data['view']['type']](data)

    return result


def get_model(data):
    logger.info(data['view']['type'])

    _, model = processor_map[data['view']['type']](data)

    return model


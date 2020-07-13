import logging
import numpy as np


logger = logging.getLogger(__name__)

def get_histogram(data):
    logger.info(data)

    x = data['data']
    bins = data['view']['settings']['bins']

    logger.info(x)
    logger.info(bins)

    # try:
    #     hist, bin_edges = np.histogram(x, bins=bins)
    # except TypeError:
    #     content = {'test': 'dddd'}
    #     return Response(content, status=status.HTTP_400_BAD_REQUEST)
    hist, bin_edges = np.histogram(x, bins=bins)

    result = {}
    result['hist'] = hist
    result['binEdges'] = bin_edges

    x_array = np.array(x)
    indices = []


    l = len(bin_edges)
    for i in range(l - 1):
        left = bin_edges[i]
        right = bin_edges[i + 1]
        logger.info(left)
        logger.info(right)
        ids = []
        if i == l - 2:
            ids = list(np.where((left <= x_array) & (x_array <= right))[0])
        else:
            ids = list(np.where((left <= x_array) & (x_array < right))[0])
        logger.info(ids)
        indices.append(ids)
    result['indices'] = indices

    return result

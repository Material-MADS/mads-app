import logging
import numpy as np


logger = logging.getLogger(__name__)

def get_pie(data):
    x = data['data']
    bins = data['view']['settings']['bins']

    hist, bin_edges = np.histogram(x, bins=bins)

    result = {}
    result['values'] = hist
    result['dimensions'] = ["{:.2f}".format(x) + " - " + "{:.2f}".format(bin_edges[idx+1])  for idx, x in enumerate(bin_edges) if (idx+1) < (len(bin_edges))]

    x_array = np.array(x)

    indices = []
    l = len(bin_edges)
    for i in range(l - 1):
        left = bin_edges[i]
        right = bin_edges[i + 1]
        # logger.info(left)
        # logger.info(right)
        ids = []
        if i == l - 2:
            ids = list(np.where((left <= x_array) & (x_array <= right))[0])
        else:
            ids = list(np.where((left <= x_array) & (x_array < right))[0])
        # logger.info(ids)
        indices.append(ids)
    result['indices'] = indices

    return result

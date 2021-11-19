import logging
import numpy as np
import pandas as pd

# PCA
from sklearn import decomposition


# THIS IS WHAT WE NEED TO LOOK AT!
from sklearn import preprocessing as preproc
# from sklearn.preprocessing import StandardScaler


logger = logging.getLogger(__name__)

def get_pairwise_correlation(data):
    return data['data']

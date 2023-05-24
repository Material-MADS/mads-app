#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Jun Fujima (Former Lead Developer) [2018-2021]
#          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              gaussian_process components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'GaussianProcess' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, pandas and sklearn libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
import pandas as pd

#Gaussian Process Regression
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process import kernels as sk_kern
from sklearn.gaussian_process.kernels import ConstantKernel, RBF, WhiteKernel, DotProduct, Matern
from sklearn.preprocessing import StandardScaler
from scipy.stats import norm

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_gaussian_process(data):
    # logger.info(data)
    feature_columns = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    information = data['view']['settings']['information']

    dataset = data['data']
    df = pd.DataFrame(dataset)
    df_train = df[[i['column'] for i in feature_columns]]
    x = df_train.values
    df_target = df[target_column]
    y = np.array(df_target)
    
    #---------------------------------------------------------------------------------------------
    # select the highest kernel
    # X_train, X_test, y_train, y_test = train_test_split(df_train, df_target, test_size=0.2, random_state=2)
    # kernels = [
    #           ConstantKernel() * DotProduct() + WhiteKernel(),
    #           ConstantKernel() * RBF() + WhiteKernel() + ConstantKernel() * DotProduct(),
    #           ConstantKernel() * RBF(np.ones(2)) + WhiteKernel(),
    #           ConstantKernel() * RBF(np.ones(2)) + WhiteKernel() + ConstantKernel() * DotProduct(),
    #           ConstantKernel() * Matern(nu=1.5) + WhiteKernel(),
    #           ConstantKernel() * Matern(nu=1.5) + WhiteKernel() + ConstantKernel() * DotProduct(),
    #           ConstantKernel() * Matern(nu=0.5) + WhiteKernel(),
    #           ConstantKernel() * Matern(nu=0.5) + WhiteKernel() + ConstantKernel() * DotProduct(),
    #           ConstantKernel() * Matern(nu=2.5) + WhiteKernel(),
    #           ConstantKernel() * Matern(nu=2.5) + WhiteKernel() + ConstantKernel() * DotProduct()
    #         ]
    
    highest_kernel = ConstantKernel() * RBF(np.ones(len(feature_columns))) + WhiteKernel() + ConstantKernel() * DotProduct()
    # max_value = -float('inf')
    # num_validation = 10
    # for k in kernels :
    #     total_score = 0
    #     for i in range(num_validation):
    #         model = GaussianProcessRegressor(k)
    #         model.fit(X_train, y_train)
    #         score = model.score(X_test, y_test)
    #         total_score += score
    #     average_score = total_score / num_validation
    #     if max_value < average_score :
    #         max_value = average_score
    #         highest_kernel = k
    #         logger.info(k)
        
    #---------------------------------------------------------------------------------------------

    model = GaussianProcessRegressor(highest_kernel)
    model.fit(x, y)

    data = {}
    d1 = {}
    d2 = {}
    for i in feature_columns :
        d1[i['column']] = np.linspace(float(i['greater']), float(i['less']), 20)

    #--------------------------------------------------------------------------------------------
    #create meshgrid for predict        
    number_variables = len(d1)
    if number_variables == 1 :
        pred_values = pd.DataFrame(d1).values
        pred,std = model.predict(pred_values, return_std=True)
        d2['Prediction'] = pred
        d2['Standard Devision'] = std

    elif number_variables == 2 :
        mesh_values = [d1[keys] for keys in d1]
        meshgrid = []
        for k, i in zip(d1, np.meshgrid(*mesh_values)):
            meshgrid.append(i.reshape(-1))
            d1[k] = i
        pred_values = np.column_stack(meshgrid)
        pred, std = model.predict(pred_values,return_std=True)
        d2['Prediction'] = np.reshape(pred, (20, 20))
        d2['Standard Devision'] = np.reshape(std, (20, 20))
    
    else :
        mesh_values = [d1[keys] for keys in d1]
        meshgrid = []
        for k, i in zip(d1, np.meshgrid(*mesh_values)):
            meshgrid.append(i.reshape(-1))
            d1[k] = i.reshape(-1)
        logger.info(d1)
        pred_values = np.column_stack(meshgrid)
        pred, std = model.predict(pred_values,return_std=True)
        d2['Prediction'] = pred
        d2['Standard Devision'] = std
    


    # #Acquisition function
    y_max = np.max(y)
    y_std = np.std(y)

    Xi = y_std * 0.01
    EI = np.zeros(len(pred))
    ind = np.where(pred != 0)[0]
    pred = pred[ind] 
    std = std[ind]
    Z = (y_max + pred - Xi) / std
    EI.flat[ind] = std * Z * np.array([norm.cdf(z) for z in Z]) + std * np.array([norm.pdf(z) for z in Z])
    
    if number_variables == 2:
        d2['Expected Improvement'] = np.reshape(EI, (20, 20))
    else:
        d2['Expected Improvement'] = EI
    data['feature_columns'] = d1
    data[target_column] = d2

    # logger.info(data)

    return data

#-------------------------------------------------------------------------------------------------
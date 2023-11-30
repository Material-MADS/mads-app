#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Yoshiki Hasukawa (Student Developer and Component Design) [2023]
#          Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'gaussian_process' components
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
import math
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
    feature_columns = data['view']['settings']['featureColumns']
    target_column = data['view']['settings']['targetColumn']
    kernel = data['view']['settings']['kernel']
    dataset = data['data']
    #---------------------------------------------------------------------------------------------
    #kernel
    if kernel == 'ConstantKernel() * RBF() + WhiteKernel()':
        kernel = ConstantKernel() * RBF() + WhiteKernel()
    elif kernel == 'ConstantKernel() * DotProduct() + WhiteKernel()':
        kernel = ConstantKernel() * DotProduct() + WhiteKernel()
    elif kernel == 'ConstantKernel() * RBF() + WhiteKernel() + ConstantKernel() * DotProduct()':
        kernel = ConstantKernel() * RBF() + WhiteKernel() + ConstantKernel() * DotProduct()
    elif kernel == 'ConstantKernel() * RBF(np.ones()) + WhiteKernel()':
        kernel = ConstantKernel() * RBF(np.ones(len(feature_columns))) + WhiteKernel()
    elif kernel == 'ConstantKernel() * RBF(np.ones()) + WhiteKernel() + ConstantKernel() * DotProduct()':
        kernel = ConstantKernel() * RBF(np.ones(len(feature_columns))) + WhiteKernel() + ConstantKernel() * DotProduct()
    #----------------------------------------------------------------------------------------------

    result = {}

    if "route" in data['view']['settings']:
        df = pd.DataFrame(dataset)
        df_train = df[[i for i in feature_columns]]
        x = df_train.values
        df_target = df[target_column]
        y = np.array(df_target)

        num_validation = 10
        total_score = 0
        for i in range(num_validation):
            X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=i)
            model = GaussianProcessRegressor(kernel)
            model.fit(X_train, y_train)
            score = model.score(X_test, y_test)
            total_score += score
        mean_score = total_score / num_validation

        if(math.isnan(mean_score)):
            mean_score = "Score Calculation Failed - The data set is too small (<=5)."

        result = {'serverReply': mean_score}
    else:
        target_EI = data['view']['settings']['targetEI']
        elements = math.floor(math.pow(int(data['view']['settings']['numberOfElements']), 1 / len(feature_columns)))

        dataset = data['data']
        df = pd.DataFrame(dataset)
        df_train = df[[i['column'] for i in feature_columns]]
        x = df_train.values
        df_target = df[target_column]
        y = np.array(df_target)

        #---------------------------------------------------------------------------------------------
        #machine learning (gaussian process regression)
        model = GaussianProcessRegressor(kernel)
        model.fit(x, y)

        data = {}
        d1 = {}
        d2 = {}
        step = []
        for i in feature_columns :
            d1[i['column']] = np.linspace(float(i['min']), float(i['max']), elements)
            step.append( len(d1[i['column']]) )

        #--------------------------------------------------------------------------------------------
        #prediction
        number_variables = len(d1)
        if number_variables == 1 :
            pred_values = pd.DataFrame(d1).values
            pred,std = model.predict(pred_values, return_std=True)
            d2['Prediction'] = pred
            d2['Standard Deviation'] = std

        elif number_variables == 2 :
            mesh_values = [d1[keys] for keys in d1]
            meshgrid = []
            for k, i in zip(d1, np.meshgrid(*mesh_values)):
                meshgrid.append(i.reshape(-1))
                d1[k] = i
            pred_values = np.column_stack(meshgrid)
            pred, std = model.predict(pred_values,return_std=True)
            d2['Prediction'] = np.reshape(pred, (step[1], step[0]))
            d2['Standard Deviation'] = np.reshape(std, (step[1], step[0]))

        else :
            mesh_values = [d1[keys] for keys in d1]
            meshgrid = []
            for k, i in zip(d1, np.meshgrid(*mesh_values)):
                meshgrid.append(i.reshape(-1))
                d1[k] = i.reshape(-1)
            pred_values = np.column_stack(meshgrid)
            pred, std = model.predict(pred_values,return_std=True)
            d2['Prediction'] = pred
            d2['Standard Deviation'] = std

        #Acquisition function
        y_std = np.std(y)

        Xi = y_std * 0.01
        EI = np.zeros(len(pred))
        ind = np.where(std != 0)[0]
        pred = pred[ind]
        std = std[ind]
        if target_EI == 'Maximization':
            y_max = np.max(y)
            Z = (y_max + pred - Xi) / std
        else :
            y_min = np.min(y)
            Z = (y_min - pred - Xi) / std
        EI.flat[ind] = std * Z * np.array([norm.cdf(z) for z in Z]) + std * np.array([norm.pdf(z) for z in Z])
        if number_variables == 2:
            d2['Expected Improvement'] = np.reshape(EI, (step[1], step[0]))
        else:
            d2['Expected Improvement'] = EI
        data['feature_columns'] = d1
        data[target_column] = d2

        #Bayesian optimization
        size = len(EI)
        top_ten_percent = int(size * 0.1)
        max_index = np.argsort(EI)[::-1][:top_ten_percent]
        top_ten_percent_EI = [round(num, 10) for num in EI[max_index]]
        top_ten_percent_feature = pred_values[max_index]
        header_values = [["<b>rank</b>"], ["<b>EI</b>"]]
        for i in feature_columns:
            header_values.append(["<b>" + i['column'] + "</b>"])

        values = []
        rank = [ i + 1 for i in range(top_ten_percent)]
        values.append(rank)
        values.append(top_ten_percent_EI)
        for i in top_ten_percent_feature.T:
            values.append(i)

        data['bayesian_optimization'] = {'header_values': header_values, 'values': values}
        # logger.info(data)

        result = data

    return result


#-------------------------------------------------------------------------------------------------

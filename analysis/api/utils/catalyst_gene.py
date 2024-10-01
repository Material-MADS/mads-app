#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
#          Jun Fujima (Former Lead Developer) [2018-2021]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'custom' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'custom' component.
# ------------------------------------------------------------------------------------------------
# References: logging libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import math
import numpy as np
import pandas as pd
import json
import string
from nltk import edit_distance

from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import Normalizer
from sklearn.preprocessing import MaxAbsScaler
from sklearn.preprocessing import MinMaxScaler

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_catalyst_gene(data):
    logger.info(data["view"])
    feature_columns = data['view']['settings']['featureColumns']
    fields = data["data"]['main']["schema"]["fields"]
    columns = [fields[a]["name"] for a in range(len(fields))]
    dataset = data["data"]["main"]['data']
    root_catalyst = data['view']['settings']['rootCatalyst']
    visualization = data['view']['settings']["visualizationMethod"]
    distance_border = 2

    result = {}
    result['featureColumns'] = feature_columns
    result['visualizationMethod'] = visualization
    result['rootCatalyst'] = root_catalyst
    
    df_original = pd.DataFrame(dataset, columns =columns)

    df = df_original.loc[:,feature_columns]

    #  check whether data has more than 3 valid columns  #
    df_concat =[]
    for column in feature_columns:
        numeric_column = pd.to_numeric(df[column], errors='coerce')
        df_concat.append(pd.DataFrame(numeric_column, columns = [column]))
    df_numerized = pd.concat(df_concat, axis = 1)
    df_numerized.dropna(axis = 1, inplace = True)
    if len(df_numerized.columns.values.tolist()) < 3:
        result["error"] = ["more than 3 valid columns are required"]

    else:
        logger.info(data['view']['settings'].keys())
        #  Scaling the data if user specified the mehod  #
        if "preprocessingEnabled" in data['view']['settings'].keys():
            if data['view']['settings']["preprocessingEnabled"] == True:
                scaling = data['view']['settings']['preprocMethod']
                if scaling == 'StandardScaler':
                    scaler = StandardScaler()
                elif scaling == 'Normalizer':
                    scaler = Normalizer()
                elif scaling == 'MaxAbsScaler':
                    scaler = MaxAbsScaler()
                elif scaling == 'MinMaxScaler':
                    min_value = data['view']["settings"]["options"]["scaling"]["min"]
                    max_value = data['view']["settings"]["options"]["scaling"]["max"]
                    scaler = MinMaxScaler(feature_range=(min_value, max_value))
                scaled_df = pd.DataFrame(scaler.fit_transform(df_numerized), columns = df_numerized.columns)
            else:
                scaled_df = df_numerized
        else:
            scaled_df = df_numerized
        result["scaledData"]= scaled_df
        result["columnsForGene"] = scaled_df.columns

##################################################################################################################################################
#########   clustering   #########################################################################################################################
        array_data = scaled_df.values

        linkage_matrix = linkage(array_data, method='ward')

        dendrogram_result = dendrogram(linkage_matrix, labels = df_original["Catalyst"].values.tolist(), no_plot=True)

        line_points = []

        for i in range(len(dendrogram_result['icoord'])):
            for j in range(len(dendrogram_result['icoord'][i])-1):
                
                start_x = dendrogram_result['icoord'][i][j]
                start_y = dendrogram_result['dcoord'][i][j]
                end_x = dendrogram_result['icoord'][i][j+1]
                end_y = dendrogram_result['dcoord'][i][j+1]
                
                line_points.append([start_y, start_x, end_y, end_x])

        result["clusteringData"] = line_points
        result["clusteringTicks"] = dendrogram_result['ivl']
        
    ##########################################################################################################################################################
    ##########   calculate under line area  ##################################################################################################################
        scaled_df_columns = scaled_df.columns.values.tolist()
        max_in_df = np.max(scaled_df.values)
        dict_height = {}


        for i, column in enumerate(scaled_df_columns):
            
            dict_height[column] = scaled_df.loc[:, column].values.astype(float)

        area_columns = [f"area{a}" for a in range(1, len(scaled_df_columns))]

        gene_columns = [f"gene{a}" for a in range(1, len(scaled_df_columns))]

        list_df_areas = []

        list_df_genes = []

        gene_criteion = np.linspace(0, max_in_df, 20)

        genes = string.ascii_uppercase

        for i, column in enumerate(scaled_df_columns[:-1]):
            
            array_left, array_right = dict_height[scaled_df_columns[i]], dict_height[scaled_df_columns[i+1]]
            
            area = (array_left + array_right) / 2
            
            digitized = np.digitize(area, bins = gene_criteion)
            
            array_gene = np.zeros_like(array_left).astype(object)
            
            for raw in range(array_left.shape[0]):
                
                array_gene[raw] = genes[digitized[raw]-1]
                
            list_df_areas.append(pd.DataFrame(area, columns = [area_columns[i]]))
            
            list_df_genes.append(pd.DataFrame(array_gene, columns = [gene_columns[i]]))
               
        df_area = pd.concat(list_df_areas, axis = 1)
        df_gene_area = pd.concat([df_original] + list_df_areas + list_df_genes, axis = 1)

        result['areaData'] = df_area

        array_for_gene = df_gene_area.loc[:, gene_columns].values

        df_gene = pd.DataFrame(np.sum(array_for_gene, axis = 1), columns = ["catalyst_gene"])

        df_gene_introduced = pd.concat([df_gene_area, df_gene], axis = 1)

        result['dfGeneIntroduced'] = df_gene_introduced

############################################################################################################################################################
################  returning the heatmap data    ############################################################################################################
################  sort rows to match the clustering result  ###############################################################################################

        df_for_heatmap = df_gene_introduced.copy()

        catalysts = []
        df_for_heatmap = df_for_heatmap.iloc[dendrogram_result['leaves'], :]
        df_for_heatmap.reset_index(drop= True, inplace = True)
        heat_map_columns = [a for a in df_for_heatmap.columns if "area" in a]
        array_heatmap = df_for_heatmap.loc[:, heat_map_columns].values

        logger.info(df_gene_introduced["Catalyst"].tolist() == df_for_heatmap["Catalyst"].tolist())

        yData = []
        xData = []
        heatVal = []
        data = []
        for i in range(len(df_for_heatmap.index)):

            dic_data = {}

            catalysts.append(df_for_heatmap["Catalyst"].values.tolist()[i])

            for j in range(len(heat_map_columns)):
                yData.append(i)

                xData.append(j)

                heatVal.append(array_heatmap[i, j])  

                dic_data['xData'] = j
                dic_data['yData'] = i
                dic_data['Catalyst'] = df_for_heatmap["Catalyst"].values.tolist()[i]
                dic_data['heatVal'] = array_heatmap[i, j]    

            data.append(dic_data)       
        
        logger.info(catalysts == dendrogram_result['ivl']) 
        # logger.info(dendrogram_result['ivl'])
        result['heatmapData'] = {}
        result['heatmapData']['Datas'] = data
        result['heatmapData']['xData'] = xData
        result['heatmapData']['yData'] = yData
        result['heatmapData']['heatVal'] = heatVal
        result['heatmapData']['xTicks'] = heat_map_columns
        result['heatmapData']['yTicks'] = catalysts

#############################################################################################################################################################
##########  edit_distance and sort data by distance from the root_catalyst_gene  ############################################################################

        root_index = df_gene_introduced[df_gene_introduced["Catalyst"] == root_catalyst].index[0]
        logger.info(f'root_index is {root_index}')

        df_root_raw = df_gene_introduced[df_gene_introduced["Catalyst"] == root_catalyst].copy()

        df_root_raw["distance"] = np.array(0)

        root_gene = df_gene_introduced[df_gene_introduced["Catalyst"] == root_catalyst]["catalyst_gene"].values

        array_distance = np.zeros_like(df_gene_introduced.iloc[:, 0])

        array_distance[root_index] = 0

        for index in df_gene_introduced.index.tolist():
            
            compare_catalyst = df_gene_introduced.loc[index,"Catalyst"]
            
            compare_gene = df_gene_introduced[df_gene_introduced["Catalyst"] == compare_catalyst]["catalyst_gene"].values
            
            array_distance[index] = edit_distance(root_gene[0], compare_gene[0], substitution_cost=1, transpositions=False)
            # logger.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
            # logger.info("Calculated edit distance for catalyst: %s", compare_catalyst)


        df_distance = pd.DataFrame(array_distance, columns = ["distance"])

        df_compare_distance_introduced = pd.concat([df_gene_introduced, df_distance], axis = 1)

        ########  ensure that the root catalyst come to the top  ###################
        df_compare_distance_introduced.drop(index=root_index, axis=0, inplace=True)

        df_compare_distance_introduced.sort_values(by = ["distance"], ascending = [True], inplace = True)

        df_distance_introduced = pd.concat([df_root_raw, df_compare_distance_introduced], axis = 0)
        
        df_distance_introduced.reset_index(drop = True, inplace = True)

        logger.info(df_distance_introduced.columns)

        result['dfDistanceIntroduced'] = df_distance_introduced

        df_similar_gene_catalyst = df_distance_introduced[df_distance_introduced["distance"] <= distance_border]["Catalyst"].values.tolist()

        result['similarGeneCatalyst'] = df_similar_gene_catalyst

        area_columns = [a for a in df_distance_introduced.columns if "area" in a]

        dict_area_cat =  {}

        for i, catalyst in enumerate(df_distance_introduced["Catalyst"]):
            df_cat = df_distance_introduced.iloc[i, :]
            dict_area_cat[catalyst] = df_cat[area_columns].values.tolist()

        result["parallelData"] = dict_area_cat
        
    return result
#-------------------------------------------------------------------------------------------------

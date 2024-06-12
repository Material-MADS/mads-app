#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q4 2024
# ________________________________________________________________________________________________
# Authors: Akihiro Honda
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'NetworkAnalysis' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'NetworkAnalysis' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, pandas and networkx
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
import pandas as pd
import networkx as nx
import networkx.algorithms.centrality as nxc

from networkx.algorithms.community import greedy_modularity_communities
from networkx.algorithms.community import label_propagation_communities

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_network_analysis(data):
    logger.info(data)

    links = data['data']['linkList']
    df = pd.DataFrame(links)
    G = nx.from_pandas_edgelist(df, source="sn", target="tn")

    connecteds = []
    colors = []
    node_colors = {}

    if(data['data']['clustering'] == True):
        for i, c in enumerate(greedy_modularity_communities(G)):
            connecteds.append(c)
            colors.append(i)
        for node in G.nodes():
            for i, c in enumerate(connecteds):
                if node in c:
                    node_colors[node] = (colors[i])
                    break
    # logger.info('node_colors')
    # logger.info(node_colors)

    data['data']['clusters'] = node_colors

    if(data['data']['centralityType'] == "Degree"):
        deg = nxc.degree_centrality(G)
        data['data']['cerl'] = deg
    
    elif(data['data']['centralityType'] == "Eigenvector"):
        eig = nxc.eigenvector_centrality(G)
        data['data']['cerl'] = eig
    
    elif(data['data']['centralityType'] == "Katz"):
        kz = nxc.katz_centrality(G, alpha=0.1, beta=1.0)
        data['data']['cerl'] = kz
    
    elif(data['data']['centralityType'] == "PageRank"):
        pr = nx.pagerank(G, alpha=0.85, max_iter=100, tol=1e-06)
        data['data']['cerl'] = pr

    elif(data['data']['centralityType'] == "Betweenness"):
        bc = nxc.betweenness_centrality(G)
        data['data']['cerl'] = bc

    elif(data['data']['centralityType'] == "Closeness"):
        cc = nxc.closeness_centrality(G)
        scc = {key: val**3 for key, val in cc.items()}
        data['data']['cerl'] = scc
    
    elif(data['data']['centralityType'] == ''):
        no = nxc.degree_centrality(G)
        non = {key: val*0+1 for key, val in no.items()}
        data['data']['cerl'] = non
    

    # data['data']['test'] = {'test1','test2'}
    # data['data']['justtest'] = "what is happening???"

    result = data['data']

    logger.info(result)
        
    return result
#-------------------------------------------------------------------------------------------------
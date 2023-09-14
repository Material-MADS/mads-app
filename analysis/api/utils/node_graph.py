#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'node graph' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'node graph' component.
# ------------------------------------------------------------------------------------------------
# References: logging libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import pandas as pd
import networkx as nx
import networkx.algorithms.centrality as nxc

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_node_graph(data):

    #-------------------------------------------------------------------------------------------------
    # THIS IS NOT USED AND CAN BE DELETED, BUT IN CASE WE NEED IT IN THE FUTURE, WE JUST LEAVE IT HERE
    #-------------------------------------------------------------------------------------------------

    # logger.info(data['data'])

    # links = data['data']['linkList']
    # df = pd.DataFrame(links)

    # # PAGERANK
    # G = nx.from_pandas_edgelist(df, source="sn", target="tn")
    # pr = nx.pagerank(G)
    # data['data']['pr'] = pr


    # # BETWEENESS
    # G = nx.from_pandas_edgelist(df, source="sn", target="tn")
    # bc = nxc.betweenness_centrality(G)
    # data['data']['bc'] = bc


    # # FREQUENCY
    # fs = df["sn"].value_counts()
    # data['data']['fs'] = fs


    # CLOSENESS
    # G = nx.from_pandas_edgelist(df, source="sn", target="tn")
    # cc = nxc.closeness_centrality(G)
    # data['data']['cc'] = cc

    # DEGREE
    # G = nx.from_pandas_edgelist(df, source="sn", target="tn")
    # deg = nxc.degree_centrality(G)
    # data['data']['deg'] = deg

    return data['data']
#-------------------------------------------------------------------------------------------------

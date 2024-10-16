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
import scipy.sparse
import networkx as nx
import networkx.algorithms.centrality as nxc

from networkx.algorithms.community import greedy_modularity_communities
from networkx.algorithms.community import louvain_communities
from networkx.algorithms.community import girvan_newman
from networkx.algorithms.community import label_propagation_communities

logger = logging.getLogger(__name__)

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_network_analysis(data):
    # logger.info(data)

    links = data['data']['linkList']
    df = pd.DataFrame(links)
    G = nx.from_pandas_edgelist(df, source="sn", target="tn")

    connecteds = []
    colors = []
    node_colors = {}

    if(data['data']['clusteringMethod'] == 'Greedy'):
        for i, c in enumerate(greedy_modularity_communities(G)):
            connecteds.append(c)
            colors.append(i)
        for node in G.nodes():
            for i, c in enumerate(connecteds):
                if node in c:
                    node_colors[node] = (colors[i])
                    break

    elif(data['data']['clusteringMethod'] == 'Louvain'):
        communities = louvain_communities(G)
        for i, community in enumerate(communities):
            for node in community:
                node_colors[node] = i
        colors = [node_colors[node] for node in G.nodes()]

    elif(data['data']['clusteringMethod'] == 'Girvan-Newman'):
        comp = girvan_newman(G)
        limited = tuple(sorted(c) for c in next(comp))
        node_colors = {}
        for i, community in enumerate(limited):
            for node in community:
                node_colors[node] = i
        colors = [node_colors[node] for node in G.nodes()]
    
    elif(data['data']['clusteringMethod'] == 'Label Propagation'):
        communities = label_propagation_communities(G)
        node_colors = {}
        for i, community in enumerate(communities):
            for node in community:
                node_colors[node] = i
        colors = [node_colors[node] for node in G.nodes()]

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
    
    # -------------------------------------------------------------------------------------------------------
    # if(data['data']['graphLayout'] == "Spectral Layout"):
    #     node_names = {i: f"Node_{i}" for i in range(len(G.nodes))}
    #     # ノードの名前でグラフを再構成
    #     G = nx.relabel_nodes(G, node_names)
    #     # ラプラシアン行列の計算
    #     L = nx.laplacian_matrix(G)
    #     # 固有値・固有ベクトルの計算
    #     eigenvalues, eigenvectors = scipy.sparse.linalg.eigsh(L.asfptype(), k=2, which='SM')
    #     # 座標の取得
    #     pos = {node: (eigenvectors[i, 0], eigenvectors[i, 1]) for i, node in enumerate(G.nodes())}
    #     nodes = [{"id": node, "x": float(pos[node][0]), "y": float(pos[node][1])} for node in G.nodes()]
    #     # logger.info(nodes)
    #     # logger.info(data['data']['linkList']['lw'])
    #     links = [{"sn": u, "tn": v, 'lw': 1} for u, v in G.edges()]

    #     graph_data = {"nodes": nodes, "links": links}
    #     data['data']['graphData'] = graph_data
    # else:
    #     data['data']['graphData'] = None
    # -------------------------------------------------------------------------------------------------------
    
    # Statistic Analysis
    components = nx.connected_components(G)
    for component in components:
        subgraph = G.subgraph(component)
    data['data']['density'] = nx.density(G)
    data['data']['aplength'] = nx.average_shortest_path_length(subgraph)
    data['data']['diameter'] = nx.diameter(subgraph)
    data['data']['globalcluscoe'] = nx.average_clustering(G)
    # data['data']['assortativity'] = nx.attribute_assortativity_coefficient(G, 'sn')


    result = data['data']

    logger.info(result)
        
    return result
#-------------------------------------------------------------------------------------------------
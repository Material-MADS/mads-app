#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024] 
#         Fernando Garcia-Escobar, (Developer Of Feature Engineering Code) [2024] 
#         Mikael Nicander Kuwahara (Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'Feature Engineering' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'data processing' interface of the website that
#         allows serverside work for the 'Feature Engineerign' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import os
import time
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------

#-------------------------------------------------------------------------------------------------
# Custom functions
# Custom Functions used to generate First Order Descriptors

def simple_value(descriptor):
    return(descriptor)

def inverse_value(descriptor):
    return(descriptor**-1)

def squared_value(descriptor):
    return(descriptor**2)

def inverse_square(descriptor):
    return(descriptor**-2)

def cubic_value(descriptor):
    return(descriptor**3)

def inverse_cube(descriptor):
    return(descriptor**-3)

def sqrt_value(descriptor):
    return(descriptor**0.5)

def inverse_sqrt(descriptor):
    return(descriptor**-0.5)

def exponential_value(descriptor):
    return(np.exp(descriptor))

def inverse_exponential(descriptor):
    return(np.exp(descriptor)**-1)

def ln_value(descriptor):
    return(np.log(descriptor))

def inverse_ln(descriptor):
    return(np.log(descriptor)**-1)

#-------------------------------------------------------------------------------------------------

#-------------------------------------------------------------------------------------------------
def get_feature_engineering(data):
    # logger.info(data)
    result = {}

    #Dataset loading
    #comman loading in Data Management and Catalyst Property Conversion
    target_columns_list = data['view']['settings']['targetColumns']
    first_order_descriptors_list = data['view']['settings']['firstOrderDescriptors']
    descriptor_columns_list = data['view']['settings']['descriptorColumns']
    selectedDataSource = data['view']['settings']['selectedDataSource']

    if selectedDataSource == 'Data Management':
        dataset = data['data'] 
        # Dropping row with blank data
        df = pd.DataFrame(dataset)
        df = df.dropna().reset_index(drop=True)

        descriptors = df[descriptor_columns_list]
        #Check if the data is numeric
        try :
            descriptors = descriptors.astype('float')
        except:
            result['status'] = 'error'
            result['detail'] = "could not convert string to float. Data contains strings. Please enter a numerical value."
            return result
        # logger.info(descriptors)

        targets = df[target_columns_list]
        # logger.info(targets)
    else :
        columns_list = data['view']['settings']['propertyConversionDS']['header']
        data_dict = data['view']['settings']['propertyConversionDS']['data']
        df  = pd.DataFrame(data=data_dict.values(), columns=columns_list)
        targets = df[target_columns_list]
        if 'all' in descriptor_columns_list:
            descriptors = df[property_list]
        else :
            descriptors = df[descriptor_columns_list]

    # Dropping invariant columns
    descriptors.drop(columns = [x for x in descriptors.loc[:,descriptors.nunique() == 1].columns], inplace = True)
    # logger.info(descriptors)

    first_order_descriptors = {'x': [simple_value],
                           '1/(x)': [inverse_value, '1/(', ')'],
                           '(x)^2': [squared_value, '(', ')^2'],
                           '1/(x)^2': [inverse_square, '1/(', ')^2'],
                           '(x)^3': [cubic_value, '(', ')^3'],
                           '1/(x)^3': [inverse_cube, '1/(', ')^3'],
                           'sqrt(x)': [sqrt_value, 'sqrt(', ')'],
                           '1/sqrt(x)': [inverse_sqrt, '1/sqrt(', ')'],
                           'exp(x)': [exponential_value, 'exp(', ')'],
                           '1/exp(x)': [inverse_exponential, '1/exp(', ')'],
                           'ln(x)': [ln_value, 'ln(', ')'],
                           '1/ln(x)': [inverse_ln, '1/ln(', ')']
                           }
    
    descriptor_placeholder_list = []
    descriptor_placeholder_names = []
    for x in descriptors.columns.tolist():
        for descriptor_to_operate in first_order_descriptors_list:
            descriptor_placeholder_list.append(first_order_descriptors[descriptor_to_operate][0](descriptors[x]).tolist())
            if descriptor_to_operate == 'x':
                descriptor_placeholder_names.append(x)
            else:
                descriptor_placeholder_names.append(first_order_descriptors[descriptor_to_operate][1] + x + first_order_descriptors[descriptor_to_operate][2])

    first_order_descriptors = pd.DataFrame(np.array(descriptor_placeholder_list).T, columns = descriptor_placeholder_names).round(8)
    # logger.info(first_order_descriptors)

    # Dropping invariant columns

    first_order_descriptors.drop(columns = [x for x in first_order_descriptors.loc[:, first_order_descriptors.nunique() == 1].columns], inplace = True)

    # Replacing infinite values with nan values

    first_order_descriptors.replace(to_replace = [-np.inf, np.inf], value = np.nan, inplace = True)

    # Dropping columns with nan values
    first_order_descriptors.dropna(axis = 1, inplace = True)

    first_order_descriptors = pd.concat([first_order_descriptors, targets], axis = 1)
    # logger.info(first_order_descriptors)

    #Header List and Cell Data For View Table of VisComp
    header = first_order_descriptors.columns
    result['header'] = header
    data = first_order_descriptors.T.to_dict(orient='list')
    result['data'] = data
    # logger.info(header)
    # logger.info(data)
    
    result['base_descriptors'] = descriptor_columns_list

    # logger.info(run_time)
    return result
#-------------------------------------------------------------------------------------------------

# If Custom Error Message is needed use the following:
# result['status'] = 'error'
# result['detail'] = "This is the Custom Error Message"

property_list = ['atomic_number', 'atomic_radius_simple', 'atomic_radius_rahm', 'atomic_volume', 'atomic_weight', 'boiling_point', 'bulk_modulus', 'c6_gb', 'covalent_radius_cordero', 'covalent_radius_pyykko_simple', 'covalent_radius_pyykko_double', 'covalent_radius_pyykko_triple', 'covalent_radius_slater', 'density', 'dipole_polarizability', 'electron_negativity', 'electron_affinity', 'en_allen', 'en_ghosh', 'en_pauling', 'first_ion_en', 'fusion_enthalpy', 'gs_bandgap', 'gs_energy', 'gs_est_bcc_latcnt', 'gs_est_fcc_latcnt', 'gs_mag_moment', 'gs_volume_per', 'hhi_p', 'hhi_r', 'heat_capacity_mass', 'heat_capacity_molar', 'icsd_volume', 'evaporation_heat', 'heat_of_formation', 'lattice_constant', 'mendeleev_number', 'melting_point', 'molar_volume', 'num_unfilled', 'num_valence', 'num_d_unfilled', 'num_d_valence', 'num_f_unfilled', 'num_f_valence', 'num_p_unfilled', 'num_p_valence', 'num_s_unfilled', 'num_s_valence', 'period', 'specific_heat', 'thermal_conductivity', 'vdw_radius_simple', 'vdw_radius_alvarez', 'vdw_radius_mm3', 'vdw_radius_uff', 'sound_velocity', 'Polarizability']
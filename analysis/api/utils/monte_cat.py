#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors:Yoshiki Hasukawa (Student Developer, Component Design and Editor of Monte Cat Code) [2024] 
#         Fernando Garcia-Escobar, (Developer Of Monte Cat Code) [2024] 
#         Mikael Nicander Kuwahara (Lead Developer) [2021-]
# _______________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'cads_component_template' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'cads_component_template' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import time
import pandas as pd
import numpy as np
from statistics import mean
import random

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------

def get_monte_cat(data):
    result = {'process': {}, 'output': {}}
    #Dataset and General Script Parameters loading-----------------------------------------------
    #comman loading Data Management and Feature Engineering
    temperature = data['view']['settings']['temperature']
    iterations  = int(data['view']['settings']['iterations']) # Number of steps/iterations
    random_seed = data['view']['settings']['randomSeed'] # For reproducibility
    targetColumn = data['view']['settings']['targetColumn']
    selectedDataSource = data['view']['settings']['selectedDataSource']
    model_to_tested = data['view']['settings']['machineLearningModel']

    if selectedDataSource == 'Data Management':
        dataset = data['data']
        base_descriptors = data['view']['settings']['baseDescriptors']
        df_descriptors =  pd.DataFrame(data = {k: v for k, v in dataset.items() if k != targetColumn})
        df_target = pd.DataFrame(data={targetColumn: dataset[targetColumn]})
        columns_list = df_descriptors.columns.tolist() + df_target.columns.tolist()
        #Check if base descriptors are correct
        try:
            filtered_list = filter_descriptors(df_descriptors.columns.tolist(), base_descriptors)
            if filtered_list:
                raise ValueError(f'can not find base descriptors of {filtered_list}')
        except ValueError as e:
            result['status'] = 'error'
            result['detail'] = str(e)
            return result
    else:
        columns_list = data['view']['settings']['featureEngineeringDS']['header']
        data_dict = data['view']['settings']['featureEngineeringDS']['data']
        fe_target_columns = data['view']['settings']['featureEngineeringTC']
        df_dataset  = pd.DataFrame(data=data_dict.values(), columns=columns_list)
        df_descriptors =  df_dataset.drop(columns=fe_target_columns)
        df_target = df_dataset[[targetColumn]]
        base_descriptors = data['view']['settings']['featureEngineeringDS']['base_descriptors']
    
    try:
        #Check if blanks are included.
        if df_descriptors.isna().any().any() or df_target.isna().any().any():
            raise ValueError("DataFrame contains NaN values or Blank values")
        df_descriptors.astype('float')
        df_target.astype('float')
    except ValueError as e:
        result['status'] = 'error'
        result['detail'] = str(e) + '. Datasets containing blanks or strings are not allowed'
        return result

    C_value = 50               # Hyperparameter value for the SVR model
    gamma_value = 0.0001       # Hyperparameter value for the SVR model
    kB = 0.00008617333262      # Boltzmann constant in eV/K units          
    seed_value = 0             # For reproducibility
    if random_seed:
        random.seed(seed_value)    # For reproducibility

    # Script configuration

    model_dictionary = {'Support Vector Regression': SVR(kernel = 'rbf', C = C_value, gamma = gamma_value),
                        'Linear': LinearRegression(),
                        'Random Forest': RandomForestRegressor(n_estimators = 100, random_state = 0)}

    model_tested = model_dictionary[model_to_tested]

    ##Main script

    s_time = round(time.time(), 5)

    reference_dictionary = create_descriptor_reference_dictionary(df_descriptors, base_descriptors)

    counter = 1

    # Result_package is continuously updated and used to generate real-time output

    result_package = {
                    'Score': [], 
                    'Descriptor': [], 
                    'Event': []
                    }

    # Descriptor Columns

    descriptors_bank = df_descriptors.columns.tolist()
    descriptors_in_model = []

    # First iteration, where the first addition is always Greedy

    descriptors_in_model, descriptors_bank, result_package = greedy_addition(df_descriptors, df_target, descriptors_in_model, descriptors_bank, 
                                                                                    model_tested, result_package, reference_dictionary)
    counter += 1

    for i in range(iterations):
        if len(descriptors_bank) > 0: # Addition proposals do not occur if there are no Descriptors in the bank
            addition_result = random_addition(df_descriptors, df_target, descriptors_in_model, descriptors_bank, model_tested)
        else:
            addition_result = None

        if len(descriptors_in_model) > 1: # Removal proposals do not occur if there is one or less Descriptors
            removal_result = random_removal(df_descriptors, df_target, descriptors_in_model, descriptors_bank, model_tested) 
        else:
            removal_result = None

        if (addition_result != None) & (removal_result != None): # If both proposals are made, the one with the best Score outcome is selected
            if (addition_result['Score'] > removal_result['Score']) :
                path_to_take = 'Addition'
                current_result = addition_result
                round_score = current_result['Score']
            else:
                path_to_take = 'Removal'
                current_result = removal_result
                round_score = current_result['Score']
        elif removal_result == None:       # If there's no Removal proposal, the algorithm proceeds to Addition
            path_to_take = 'Addition'
            current_result = addition_result
            round_score = current_result['Score']
        else:                              # Through elimination, if there's no Addition proposal, the algorithm proceeds to Removal
            path_to_take = 'Removal'
            current_result = removal_result
            round_score = current_result['Score']

        previous_round_score = result_package['Score'][-1]
        direct_accept_condition = round_score > previous_round_score

        if direct_accept_condition:   # If the Score increases, the Descriptor in automatically added                    

            descriptors_in_model, descriptors_bank, result_package = direct_accept(path_to_take, result_package, current_result, 
                                                                                        descriptors_in_model, descriptors_bank, reference_dictionary)

        else:    # If the score's lower than last round, the Acceptance Probability is computed and compared to a 
                # random value (0 - 1) to determine if the score's added or not. Bigger differences are more likely 
                # to be rejected.

            acceptance_probability = np.exp((round_score - previous_round_score) / (kB*temperature))

            test_p = np.random.uniform()

            metropolis_test = acceptance_probability > test_p

            if metropolis_test: # If the Acceptance Probability is greater than the random value, the outcome is accepted       

                descriptors_in_model, descriptors_bank, result_package = conditional_accept(path_to_take, result_package, 
                                current_result, descriptors_in_model, descriptors_bank, reference_dictionary)

            else:

                descriptors_in_model, descriptors_bank, result_package = conditional_reject(path_to_take, result_package, 
                                        current_result, descriptors_in_model, descriptors_bank)

        counter += 1

    process_df = pd.DataFrame(data = zip(result_package['Descriptor'], result_package['Score'], result_package['Event']), 
                            columns = ['Descriptor', 'Score', 'Outcome'])

    descriptors_to_extract = reconstruct_best_model(process_df)

    output_df = pd.concat([df_descriptors[descriptors_to_extract].copy(), df_target.iloc[:, -1].copy()], axis = 1)

    output_df = output_df.reindex(columns = columns_list).dropna(axis = 1)

    ## ===================================================================================================================
    process_header = process_df.columns
    process_data = process_df.T.to_dict(orient='list')
    output_header = output_df.columns
    output_data = output_df.T.to_dict(orient='list')
    result['process']['header'] = process_header
    result['process']['data'] = process_data
    result['output']['header'] = output_header
    result['output']['data'] = output_data


    return result
#-------------------------------------------------------------------------------------------------

# Custom functions ===================================================================================================

"""
'create_descriptor_reference_dictionary' creates a dictionary with the base Descriptor names (properties) as the keys,
and all derived analogues (zeroth and first order Descriptors) stored as lists to facilitate handling Descriptor 
family addition and removals from the descriptor bank and model during algorithm execution.
"""

def create_descriptor_reference_dictionary(df_descriptors, base_descriptors):
    dataset_true_descriptors = df_descriptors.columns.tolist()
    base_descriptors = base_descriptors
    first_order_list = ['Simple', 'Inverse', 'Square', 'I_Square', 
                        'Cube', 'I_Cube', 'Sqrt', 'I_Sqrt', 'Exp', 'I_Exp', 'Ln', 'I_Ln']
    descriptor_families = []
    for b_descriptor in base_descriptors:
        family_list = []
        for first_order_analogue in first_order_list:
            if first_order_analogue == 'Simple':
                first_analogue = f'{b_descriptor}'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Inverse':
                first_analogue = f'1/({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Square':
                first_analogue = f'({b_descriptor})^2'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'I_Square':
                first_analogue = f'1/({b_descriptor})^2'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Cube':
                first_analogue = f'({b_descriptor})^3'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'I_Cube':
                first_analogue = f'1/({b_descriptor})^3'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Sqrt':
                first_analogue = f'sqrt({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'I_Sqrt':
                first_analogue = f'1/sqrt({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Exp':
                first_analogue = f'exp({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'I_Exp':
                first_analogue = f'1/exp({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'Ln':
                first_analogue = f'ln({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
            elif first_order_analogue == 'I_Ln':
                first_analogue = f'1/ln({b_descriptor})'
                if first_analogue in dataset_true_descriptors:
                    family_list.append(first_analogue)
        descriptor_families.append(family_list)
    reference_dictionary = dict(zip(base_descriptors, descriptor_families))
    return reference_dictionary

"""
'get_base_descriptor_from_analogue' when a specific descriptor analogue is selected during algorithm execution,
this function retrieves the original base descriptor name to facilitate operations with the descriptor reference
dictionary.
"""

def get_base_descriptor_from_analogue(reference_dict, analogue):
    analogue_location = [x for x in reference_dict.values() if analogue in x][0]
    base_descriptor = list(reference_dict.keys())[list(reference_dict.values()).index(analogue_location)]
    return base_descriptor

"""
'analogue_operation' works for both Descriptor family additions and removals depending on a keyword (type_of_movement).
By introducing the analogue involved in the addition / removal operation, it retrieves the respective base Descriptor
name that serves as key and removes or adds the entire Descriptor family to the bank. 
"""

def analogue_operation(analogue, reference_dict, list_to_modify, type_of_movement):
    base_descriptor = get_base_descriptor_from_analogue(reference_dict, analogue)
    if type_of_movement == 'Add':
        for x in reference_dict[base_descriptor]:
            list_to_modify.append(x)
    else:
        for x in reference_dict[base_descriptor]:
            list_to_modify.remove(x)
    return list_to_modify

"""
'train_model' is the basic function to train a regression model and return the test data's r2 mean score after 10
random data splits. In case there is an error during training, conditional clauses are present to return a score of 0.
"""

def train_model(descriptors, target, model):
    placeholder_scores = []
    for j in range(10):
        X_train, X_test, y_train, y_test = train_test_split(descriptors, target, test_size = 0.2, random_state = j)
        try:
            model.fit(X_train, y_train.values.ravel())
            placeholder_scores.append(model.score(X_test, y_test))
        except:
            placeholder_scores.append(0)
    model_score = mean(placeholder_scores)
    return model_score

"""
'greedy_addition' is the basic building block in a greedy Forward Descriptor Addition process. It tests all
Descriptors not added to a regression model, and adds the one that increases the Score the most.
In MonteCatV2, however, entire descriptor families are removed from the remaining available Descriptors in the bank,
drastically reducing the number of tested descriptors
"""

def greedy_addition(df_descriptors, df_target, descriptors_in_model, descriptors_bank, model, result_package, reference_dict):
    tested_descriptors = []
    placeholder_scores = []
    for i in descriptors_bank:
        descriptors_in_model.append(i)
        placeholder_scores.append(train_model(np.array(df_descriptors[descriptors_in_model]), df_target, model))
        tested_descriptors.append(i)
        descriptors_in_model.remove(i)
    best_score = max(placeholder_scores)
    best_descriptor = tested_descriptors[placeholder_scores.index(best_score)]
    descriptors_in_model.append(best_descriptor)
    descriptors_bank = analogue_operation(best_descriptor, reference_dict, descriptors_bank, 'Remove')
    result_package['Score'].append(best_score)
    result_package['Descriptor'].append(best_descriptor)
    result_package['Event'].append('Direct_Addition')
    return descriptors_in_model, descriptors_bank, result_package

"""
'random_addition' is used in making random addition proposals, where one Descriptor from the bank is added, and
the model's Score is calculated.
"""

def random_addition(df_descriptors, df_target, descriptors_in_model, descriptors_bank, model):
    chosen_descriptor = random.choice(descriptors_bank)
    descriptors_in_model.append(chosen_descriptor)
    model_score = train_model(np.array(df_descriptors[descriptors_in_model]), df_target, model)
    descriptors_in_model.remove(chosen_descriptor)
    proposal_result = {'Descriptor': chosen_descriptor,
                       'Score': model_score}
    return proposal_result

"""
'random_removal' is used in making random removal proposals, where one Descriptor from the model is withrawn, and
the model's Score is calculated.
"""

def random_removal(df_descriptors, df_target, descriptors_in_model, descriptors_bank, model):
    chosen_descriptor = random.choice(descriptors_in_model)
    descriptors_in_model.remove(chosen_descriptor)
    model_score = train_model(np.array(df_descriptors[descriptors_in_model]), df_target, model)
    descriptors_in_model.append(chosen_descriptor)
    proposal_result = {'Descriptor': chosen_descriptor,
                       'Score': model_score}
    return proposal_result

"""
'direct_accept' is called when the tentative proposal increases the Score, or does not decrease it. Since this is
a direct acceptance of the outcome, the Acceptance Probability Value and the Test value are not calculated. The 
function then updates the dictionary where each iteration's results are stored.
"""

def direct_accept(trigger, result_package, proposal_result, descriptors_in_model, descriptors_bank, reference_dict):
    if trigger == 'Addition':
        descriptors_in_model.append(proposal_result['Descriptor'])
        descriptors_bank = analogue_operation(proposal_result['Descriptor'], reference_dict, descriptors_bank, 'Remove')
    else:
        descriptors_in_model.remove(proposal_result['Descriptor'])
        descriptors_bank = analogue_operation(proposal_result['Descriptor'], reference_dict, descriptors_bank, 'Add')
    result_package['Score'].append(proposal_result['Score'])
    result_package['Descriptor'].append(proposal_result['Descriptor'])
    result_package['Event'].append(f'Direct_{trigger}')
    return descriptors_in_model, descriptors_bank, result_package

"""
'metropolis_accept' is called when the model's Score is lower than the previous round, but the probability test was
cleared by the random draw of the tested value vs the Acceptance Value. The function then updates the dictionary where
each iteration's results are stored.
"""

def conditional_accept(trigger, result_package, proposal_result, descriptors_in_model, descriptors_bank, reference_dict):
    if trigger == 'Addition':
        descriptors_in_model.append(proposal_result['Descriptor'])
        descriptors_bank = analogue_operation(proposal_result['Descriptor'], reference_dict, descriptors_bank, 'Remove')
    else:
        descriptors_in_model.remove(proposal_result['Descriptor'])
        descriptors_bank = analogue_operation(proposal_result['Descriptor'], reference_dict, descriptors_bank, 'Add')
    result_package['Score'].append(proposal_result['Score'])
    result_package['Descriptor'].append(proposal_result['Descriptor'])
    result_package['Event'].append(f'Conditional_{trigger}')
    return descriptors_in_model, descriptors_bank, result_package

"""
'metropolis_reject' is called when the model's Score is lower than the previous round and the probability test was not 
passed by the random draw of the tested value vs the Acceptance Value. The function then updates the dictionary where
each iteration's results are stored.
"""

def conditional_reject(trigger, result_package, proposal_result, descriptors_in_model, descriptors_bank):
    result_package['Score'].append(result_package['Score'][-1])
    result_package['Descriptor'].append(proposal_result['Descriptor'])
    result_package['Event'].append(f'{trigger}_Rejection')
    return descriptors_in_model, descriptors_bank, result_package

"""
'reconstruct_best_model' takes a summary DataFrame of the process run, retrieves the maximum observed Score and
reconstructs which Descriptors were present in that instance. The output is a list of these Descriptors, which are 
then used to select and extract them from the Training Data.
"""

def reconstruct_best_model(df_to_process):
    rearranged_df = df_to_process.sort_values(by = 'Score', ascending = False).copy()
    simplified_df = df_to_process.loc[:rearranged_df.index[0]]
    simplified_df = simplified_df[(simplified_df['Outcome'] != 'Addition_Rejection') & 
                                  (simplified_df['Outcome'] != 'Removal_Rejection')].reset_index(drop = True)
    descriptors_to_extract = []
    for descriptor, outcome in zip(simplified_df['Descriptor'], simplified_df['Outcome']):
        if 'Addition' in outcome:
            descriptors_to_extract.append(descriptor)
        elif 'Removal' in outcome:
            descriptors_to_extract.remove(descriptor)
    return descriptors_to_extract

"""Check if base descriptors are correct for descriptors List"""
def filter_descriptors(descriptor_list, base_descriptors):
    return [
        descriptor for descriptor in descriptor_list
        if not any(base in descriptor for base in base_descriptors)
    ]
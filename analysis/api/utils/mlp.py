# =================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2026
# ________________________________________________________________________________________________
# Authors: Miyu Shinotsuka[2026]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'MLP' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'MLP' component.
# ------------------------------------------------------------------------------------------------
# References: numpy, pandas, copy and sklearn libs
# =================================================================================================

# -------------------------------------------------------------------------------------------------
# Import required Libraries
# -------------------------------------------------------------------------------------------------
import numpy as np
import pandas as pd
import copy

from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

# -------------------------------------------------------------------------------------------------


# -------------------------------------------------------------------------------------------------
def get_mlp(data):
    settings = data["view"]["settings"]

    def get_safe(key, default, type_func=int):
        val = settings.get(key, default)
        if val == "" or val is None:
            return default
        return type_func(val)

    metric = settings["metric"]
    splitMode = settings.get(
        "splitMode", "Train-Val Split"
    )  # metric : True vs Predict => splitMode = Train-val Split

    feature_columns = settings["featureColumns"]
    target_column = settings["targetColumn"]

    preprocessing = settings.get("preprocessing", False)
    early_stopping = settings.get("early_stopping", False)
    patience = get_safe("patience", 5, int)

    alpha = get_safe("alpha", 0.0001, float)
    max_iter = get_safe("max_iter", 200, int)
    random_state = get_safe("random_state", 1, int)
    test_size = get_safe("test_size", 0.2, float)
    learning_rate_init = get_safe("learning_rate_init", 0.001, float)

    layercount = get_safe("n_layers", 1, int)
    layer_list = []

    for i in range(1, layercount + 1):
        layer_key = f"layer_{i}"
        if layer_key in settings:
            layer_list.append(int(settings.get(layer_key)))
        else:  # default batch size: 4
            layer_list.append(4)
    hidden_layer_size = tuple(layer_list)

    dataset = data["data"]

    # extract columns from pandas dataframe---------
    columns_needed = feature_columns + [target_column]
    filtered_dataset = {col: dataset[col] for col in columns_needed if col in dataset}
    df = pd.DataFrame(filtered_dataset)
    df_train = df[feature_columns]
    df_target = df[target_column]

    X = df_train.values
    y = df_target.values
    # --------------------------------------------

    mlp = None
    best_mlp = None

    mlp = MLPRegressor(
        hidden_layer_sizes=hidden_layer_size,
        alpha=alpha,
        max_iter=max_iter,
        random_state=random_state,
        learning_rate_init=learning_rate_init,
    )

    cv_mlp = MLPRegressor(
        hidden_layer_sizes=hidden_layer_size,
        alpha=alpha,
        max_iter=max_iter,
        random_state=random_state,
        learning_rate_init=learning_rate_init,
    )

    data = {}
    d1 = {}  # train
    d2 = {}  # validation / test

    final_test_loss = None
    final_test_r2 = None
    btr = None

    cr_score = None
    be_score = None

    cv_score = None
    scoring = {
        "mse": "neg_mean_squared_error",
        "mae": "neg_mean_absolute_error",
        "r2": "r2",
        "d2": "d2_absolute_error_score",
    }

    # split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=float(test_size), random_state=int(random_state)
    )

    # split mode: Train-Val-Test Split => split the training set into training and validation sets
    if splitMode == "Train-Val-Test Split":
        val_size = float(test_size)
        val_split_ratio = val_size / (
            1 - val_size
        )  # Calculate the ratio for validation split
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=val_split_ratio, random_state=int(random_state)
        )
    # ----------------------------------------------------------------------

    # scaling ON------------------------------------
    if preprocessing == True:
        scaler = StandardScaler()
        scaler.fit(X_train)
        X_train = scaler.transform(X_train)
        X_test = scaler.transform(X_test)

        if splitMode == "Train-Val-Test Split":
            X_val = scaler.transform(X_val)

    # ----------------------------------------------

    # Count epochs(Loss, R2)------------------------
    total_epochs = len(range(0, int(max_iter)))
    epoch_list = list(range(1, total_epochs + 1))
    # -----------------------------------------------

    # Fit the model and calculate metrics based on the selected metric---------------------------
    patience_counter = 0

    if metric == "Loss":
        train_loss = []
        test_loss = []
        best_val_loss = float("inf")

        if splitMode == "Train-Val Split":
            for i in range(0, int(max_iter)):
                mlp.partial_fit(X_train, y_train)
                train_pred = mlp.predict(X_train)
                test_pred = mlp.predict(X_test)

                curr_train_loss = mean_squared_error(y_train, train_pred)
                curr_test_loss = mean_squared_error(y_test, test_pred)
                train_loss.append(curr_train_loss)
                test_loss.append(curr_test_loss)

                if early_stopping == True and curr_test_loss < best_val_loss:
                    best_val_loss = curr_test_loss
                    patience_counter = 0

                    best_mlp = copy.deepcopy(mlp)

                elif early_stopping == True and curr_test_loss >= best_val_loss:
                    patience_counter += 1

                if patience_counter >= patience:
                    break

        elif splitMode == "Train-Val-Test Split":
            for i in range(0, int(max_iter)):
                mlp.partial_fit(X_train, y_train)
                train_pred = mlp.predict(X_train)
                test_pred = mlp.predict(X_val)

                curr_train_loss = mean_squared_error(y_train, train_pred)
                curr_test_loss = mean_squared_error(y_val, test_pred)
                train_loss.append(curr_train_loss)
                test_loss.append(curr_test_loss)

                if early_stopping == True and curr_test_loss < best_val_loss:
                    best_val_loss = curr_test_loss
                    patience_counter = 0

                    best_mlp = copy.deepcopy(mlp)

                elif early_stopping == True and curr_test_loss >= best_val_loss:
                    patience_counter += 1

                if patience_counter >= patience:
                    break

            final_test_pred = mlp.predict(X_test)
            final_test_loss = mean_squared_error(y_test, final_test_pred)
            data["final_test_loss"] = final_test_loss

        test_loss_arr = np.array(test_loss)
        best_epoch = np.argmin(test_loss_arr)
        be_score = int(best_epoch)

        best_test_loss = test_loss_arr[best_epoch]
        btl = float(best_test_loss)

        coresponding_train_loss = train_loss[best_epoch]
        cr_score = float(coresponding_train_loss)

        d1["epoch"] = epoch_list
        d1[metric] = train_loss
        d2["epoch"] = epoch_list
        d2[metric] = test_loss

        data["best_epoch"] = be_score
        data["best_test_loss"] = btl
        data["coresponding_train_loss"] = cr_score
    # -----------------------------------------------------------------------------------
    elif metric == "R2":
        train_r2 = []
        test_r2 = []
        best_val_r2 = -float("inf")

        if splitMode == "Train-Val Split":
            for i in range(0, int(max_iter)):
                mlp.partial_fit(X_train, y_train)

                curr_train_r2 = mlp.score(X_train, y_train)
                curr_test_r2 = mlp.score(X_test, y_test)
                train_r2.append(curr_train_r2)
                test_r2.append(curr_test_r2)

                if early_stopping == True and curr_test_r2 > best_val_r2:
                    best_val_r2 = curr_test_r2
                    patience_counter = 0

                    best_mlp = copy.deepcopy(mlp)
                elif early_stopping == True and curr_test_r2 <= best_val_r2:
                    patience_counter += 1

                if patience_counter >= patience:
                    break

        elif splitMode == "Train-Val-Test Split":
            for i in range(0, int(max_iter)):
                mlp.partial_fit(X_train, y_train)
                curr_train_r2 = mlp.score(X_train, y_train)
                curr_test_r2 = mlp.score(X_val, y_val)
                train_r2.append(curr_train_r2)
                test_r2.append(curr_test_r2)

                if early_stopping == True and curr_test_r2 > best_val_r2:
                    best_val_r2 = curr_test_r2
                    patience_counter = 0

                    best_mlp = copy.deepcopy(mlp)
                elif early_stopping == True and curr_test_r2 <= best_val_r2:
                    patience_counter += 1

                if patience_counter >= patience:
                    break

            final_test_r2 = mlp.score(X_test, y_test)
            data["final_test_r2"] = final_test_r2

        train_r2_arr = np.array(train_r2)

        test_r2_arr = np.array(test_r2)
        best_epoch = np.argmax(test_r2_arr)
        best_test_r2 = test_r2_arr[best_epoch]
        btr = float(best_test_r2)

        coresponding_train_r2 = train_r2_arr[best_epoch]

        cr_score = float(coresponding_train_r2)
        be_score = int(best_epoch)

        d1["epoch"] = epoch_list
        d1[metric] = train_r2
        d2["epoch"] = epoch_list
        d2[metric] = test_r2

        data["best_epoch"] = be_score
        data["best_test_r2"] = btr
        data["coresponding_train_r2"] = cr_score

    else:  # True vs Predict-----------------------------------------------------------------------
        for i in range(0, int(max_iter)):
            mlp.partial_fit(X_train, y_train)

        y_train_pred = mlp.predict(X_train)
        y_test_pred = mlp.predict(X_test)

        d1["Predict"] = y_train_pred
        d1["True"] = y_train

        d2["Predict"] = y_test_pred
        d2["True"] = y_test
    # --------------------------------------------------------------------------------------------

    if best_mlp is not None:
        mlp = best_mlp

    cv_score = cross_validate(cv_mlp, X_train, y_train, scoring=scoring)

    data["d1"] = d1
    data["d2"] = d2
    data["scores"] = cv_score

    return data, mlp


# -------------------------------------------------------------------------------------------------

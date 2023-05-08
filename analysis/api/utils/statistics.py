import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

def get_statistics(data):
    selected_columns = data["view"]["settings"]["featureColumns"]
    dataset = data["data"]
    stats_name = "Stats"

    df = pd.DataFrame(dataset)
    statistics = df.describe().round(5)
    statistics.insert(0, stats_name, statistics.index,)

    result = {}
    result["columns"] = [stats_name] + selected_columns
    result["data"] = statistics.to_dict(orient="records")

    return result

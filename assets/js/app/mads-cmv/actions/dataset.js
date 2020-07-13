// Dataset
export const DATASET_MAIN_UPDATE = 'DATASET_MAIN_UPDATE';
export const DATASET_ADD_VIEW = 'DATASET_ADD_VIEW';
export const DATASET_REMOVE_VIEW = 'DATASET_REMOVE_VIEW';

export const DATASET_VIEW_CONTENT_REQUEST = 'DATASET_VIEW_CONTENT_REQUEST';
export const DATASET_VIEW_CONTENT_SUCCESS = 'DATASET_VIEW_CONTENT_SUCCESS';
export const DATASET_VIEW_CONTENT_FAILURE = 'DATASET_VIEW_CONTENT_FAILURE';

export const updateMainDataset = (data) => ({
  type: DATASET_MAIN_UPDATE,
  data,
});

export const addDatasetView = (id, data) => ({
  type: DATASET_ADD_VIEW,
  id,
  data,
});

export const removeDatasetView = (id) => ({
  type: DATASET_REMOVE_VIEW,
  id,
});

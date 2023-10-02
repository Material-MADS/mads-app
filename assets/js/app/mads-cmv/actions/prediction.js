/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available Actions for the 'Prediction' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Prediction' let us create predictions based on previous ML runs in our components
// ------------------------------------------------------------------------------------------------
// References: api and message
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import api from '../api';
import * as messageActions from './message';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const MODEL_TEST = 'MODEL_TEST';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const createNewModel = async (model) => {
  const resCreated = await api.prediction.createModel(model);
  const createdModel = resCreated.data;

  return createdModel;
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const updateModel = async (id, model) => {
  const resUpdated = await api.prediction.updateModel(id, model);
  const updatedModel = resUpdated.data;

  return updatedModel;
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const saveModel = (name, viewSettings, overwrite, id) => async (
  dispatch,
  getState
) => {
  const model = { name };
  const metadata = {};
  model.metadata = metadata;
  model.viewSettings = viewSettings;

  if (overwrite) {
    const updatedModel = await updateModel(id, model);
    dispatch(
      messageActions.setMessage({
        header: 'Info',
        content: 'The model is stored.',
        type: 'info',
      })
    );
    dispatch(messageActions.setMessageOpen(true));
    return;
  }

  // create new model
  const createdModel = await createNewModel(model);
  dispatch(
    messageActions.setMessage({
      header: 'Info',
      content: 'The model is stored.',
      type: 'info',
    })
  );
  dispatch(messageActions.setMessageOpen(true));
};
//-------------------------------------------------------------------------------------------------

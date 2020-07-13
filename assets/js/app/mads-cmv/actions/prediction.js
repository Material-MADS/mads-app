import api from '../api';
import * as messageActions from './message';

export const MODEL_TEST = 'MODEL_TEST';
// export const SET_MESSAGE_OPEN = 'SET_MESSAGE_OPEN';

const createNewModel = async (model) => {
  const resCreated = await api.prediction.createModel(model);
  const createdModel = resCreated.data;

  return createdModel;
};

const updateModel = async (id, model) => {
  const resUpdated = await api.prediction.updateModel(id, model);
  const updatedModel = resUpdated.data;

  return updatedModel;
};

export const saveModel = (name, viewSettings, overwrite, id) => async (
  dispatch,
  getState
) => {
  console.log('Saving model ...');
  // const state = getState();
  const model = { name };
  const metadata = {};
  model.metadata = metadata;
  model.viewSettings = viewSettings;

  if (overwrite) {
    const updatedModel = await updateModel(id, model);
    // dispatch(receiveWorkspaceInfo(updatedWorkspace));
    dispatch(
      messageActions.setMessage({
        header: 'Info',
        content: 'The model is stored.',
        type: 'info',
      })
    );
    dispatch(messageActions.setMessageOpen(true));
    console.log(updatedModel);
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
  console.log(createdModel);
};

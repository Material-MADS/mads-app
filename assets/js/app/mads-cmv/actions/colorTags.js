export const ADD_COLORTAG = 'ADD_COLORTAG';
export const REMOVE_COLORTAG = 'REMOVE_COLORTAG';
export const UPDATE_COLORTAG = 'UPDATE_COLORTAG';

export const addColorTag = (colorTag) => ({
  type: ADD_COLORTAG,
  colorTag,
});

export const removeColorTag = (id) => ({
  type: REMOVE_COLORTAG,
  id,
});

export const updateColorTag = (id, properties) => ({
  type: UPDATE_COLORTAG,
  id,
  properties,
});

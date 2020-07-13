import ColorTag from '../models/ColorTag';

const getUpdatedColorTagState = (state, id, properties) => {
  const newState = [...state];

  const index = newState.findIndex((c) => c.id === id);
  const oldTag = newState[index];
  const newTag = new ColorTag({
    id,
    color: oldTag,
    itemIndices: oldTag.itemIndices,
  });

  if (properties.color) {
    newTag.color = properties.color;
  }
  if (properties.itemIndices) {
    newTag.itemIndices = properties.itemIndices;
  }

  newState[index] = newTag;

  return newState;
};

export default { getUpdatedColorTagState };

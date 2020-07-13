const getUpdatedViewsState = (state, id, settings) => {
  const newState = [...state];

  const target = newState.find((v) => v.id === id);
  if (target) {
    target.settings = settings;
  }

  return newState;
};

export default { getUpdatedViewsState };

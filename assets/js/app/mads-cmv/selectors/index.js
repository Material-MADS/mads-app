import { createSelector } from 'reselect';

const viewsSelector = (state) => state.views;

const viewSelector = (state, id) =>
  createSelector([viewsSelector], (views) => {
    console.warn(state, id);
    const a = views.find((view) => view.id === id);
    console.warn(a);
    return a;
  });

export default viewSelector;

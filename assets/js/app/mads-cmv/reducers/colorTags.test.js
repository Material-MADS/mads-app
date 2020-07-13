import reducer from './colorTags';
import { ADD_COLORTAG, REMOVE_COLORTAG, UPDATE_COLORTAG } from '../actions';
import ColorTag from '../models/ColorTag';

describe('colorTags Reducer', () => {
  test('initial state', () => {
    const state = undefined;
    const action = {};
    const result = reducer(state, action);
    const expected = [];
    expect(result).toEqual(expected);
  });

  test('ADD_TASK action', () => {
    const state = [];
    const c = new ColorTag();

    const action = {
      type: ADD_COLORTAG,
      colorTag: c,
    };
    const result = reducer(state, action);
    const expected = [c];
    expect(result).toEqual(expected);
  });

  test('REMOVE_COLORTAG action', () => {
    const c1 = new ColorTag();
    const c2 = new ColorTag();
    const state = [c1, c2];
    const action = {
      type: REMOVE_COLORTAG,
      id: c2.id,
    };
    const result = reducer(state, action);
    const expected = [c1];
    expect(result).toEqual(expected);
  });

  test('UPDATE_COLORTAG action', () => {
    const c1 = new ColorTag();
    const c2 = new ColorTag();
    const state = [c1, c2];
    const action = {
      type: UPDATE_COLORTAG,
      id: c2.id,
      properties: { color: 'black' },
    };
    const result = reducer(state, action);
    expect(result[1].color).toMatch('black');
  });
});

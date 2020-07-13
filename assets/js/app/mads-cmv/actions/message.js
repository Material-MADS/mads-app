export const SET_MESSAGE = 'SET_MESSAGE';
export const SET_MESSAGE_OPEN = 'SET_MESSAGE_OPEN';

export const setMessage = ({ header, content, type }) => ({
  type: SET_MESSAGE,
  message: {
    header,
    content,
    type,
  },
});

export const setMessageOpen = (state) => ({
  type: SET_MESSAGE_OPEN,
  state,
});

export const showMessage = ({ header, content, type }) => (dispatch) => {
  dispatch(setMessage({ header, content, type }));
  dispatch(setMessageOpen(true));
};

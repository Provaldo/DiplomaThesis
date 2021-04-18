import { GET_MESSAGES } from "../actions/types";

const initialState = {};

export default (function (state = initialState, { type, payload }) {
  Object.freeze(state);
  switch (type) {
    case GET_MESSAGES:
      return {
        ...state,
        message: payload.message,
      };
    default:
      return state;
  }
});

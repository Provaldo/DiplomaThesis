import { CLEAR_RMQ_MESSAGES, GET_RMQ_MESSAGES } from "../actions/types";

const initialState = {};

export default (function (state = initialState, { type, payload }) {
  Object.freeze(state);
  switch (type) {
    case GET_RMQ_MESSAGES:
      return {
        ...state,
        message: payload.message,
      };
    case CLEAR_RMQ_MESSAGES:
      return initialState;
    default:
      return state;
  }
});

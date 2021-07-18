import {
  CLEAR_RMQ_MESSAGES,
  GET_RMQ_MESSAGES,
  SET_CURRENT_USER,
  CREATE_RMQ_SERVER,
  DELETE_RMQ_SERVER,
  CREATE_CONSUMER,
  DELETE_CONSUMER,
} from "../actions/types";

const initialState = {};

export default (function (state = initialState, { type, payload }) {
  Object.freeze(state);
  switch (type) {
    case CREATE_RMQ_SERVER:
    case DELETE_RMQ_SERVER:
    case CREATE_CONSUMER:
    case DELETE_CONSUMER:
    case GET_RMQ_MESSAGES:
      return {
        ...state,
        message: payload.message,
      };
    case SET_CURRENT_USER:
    case CLEAR_RMQ_MESSAGES:
      return initialState;
    default:
      return state;
  }
});

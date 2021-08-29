import {
  CLEAR_RMQ_MESSAGES,
  GET_RMQ_MESSAGES,
  SET_CURRENT_USER,
  CREATE_RMQ_SERVER,
  DELETE_RMQ_SERVER,
  CREATE_CONSUMER,
  DELETE_CONSUMER,
  CREATE_PRODUCER,
  START_OVERVIEW_STREAM,
  GET_STREAM_DATA,
} from "../actions/types";

const _nullOverview = {
  // This is so that we can always call overview.{field} on our overview object and not error out if there isn't an overview object yet
  // test: null,
  // general: null,
};

const initialState = {
  // streamEvents: null,
  // overview: _nullOverview,
};

export default (function (state = initialState, { type, payload }) {
  Object.freeze(state);
  switch (type) {
    case CREATE_RMQ_SERVER:
    case DELETE_RMQ_SERVER:
    case CREATE_CONSUMER:
    case DELETE_CONSUMER:
    case CREATE_PRODUCER:
    case GET_RMQ_MESSAGES:
      return {
        ...state,
        message: payload.message,
      };
    case SET_CURRENT_USER:
    case CLEAR_RMQ_MESSAGES:
      return initialState;
    // case START_OVERVIEW_STREAM:
    //   return {
    //     ...state,
    //     streamEvents: payload,
    //   };
    // case GET_STREAM_DATA:
    //   return {
    //     ...state,
    //     overview: { ...payload },
    //   };
    default:
      return state;
  }
});

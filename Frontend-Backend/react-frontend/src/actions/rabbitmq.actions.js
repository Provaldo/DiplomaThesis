import axios from "axios";
import {
  GET_RMQ_MESSAGES,
  GET_ERRORS,
  CLEAR_RMQ_MESSAGES,
  LOGOUT_CURRENT_USER,
} from "./types";

export const createProducer = () => (dispatch) => {
  axios
    .post("/api/rabbitmq/user/producer")
    .then((res) => {
      dispatch({
        type: GET_RMQ_MESSAGES,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
      if (
        err.response.data.message &&
        err.response.data.message === "No valid session exists!"
      ) {
        dispatch({ type: LOGOUT_CURRENT_USER });
      }
      dispatch({
        type: CLEAR_RMQ_MESSAGES,
      });
    });
};

export const createConsumer = () => (dispatch) => {
  axios
    .post("/api/rabbitmq/user/consumer")
    .then((res) => {
      dispatch({
        type: GET_RMQ_MESSAGES,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
      if (
        err.response.data.message &&
        err.response.data.message === "No valid session exists!"
      ) {
        dispatch({ type: LOGOUT_CURRENT_USER });
      }
      dispatch({
        type: CLEAR_RMQ_MESSAGES,
      });
    });
};

import axios from "axios";
import {
  GET_RMQ_MESSAGES,
  GET_ERRORS,
  CLEAR_RMQ_MESSAGES,
  LOGOUT_CURRENT_USER,
  CLEAR_ERRORS,
  CREATE_RMQ_SERVER,
  DELETE_RMQ_SERVER,
  CREATE_CONSUMER,
  DELETE_CONSUMER,
} from "./types";

export const createRMQServer = (credentials) => (dispatch) => {
  dispatch({
    type: CLEAR_RMQ_MESSAGES,
  });
  dispatch({
    type: CLEAR_ERRORS,
  });

  axios
    .post("/api/rabbitmq/user/createRMQServer", credentials)
    .then((res) => {
      dispatch({
        type: CREATE_RMQ_SERVER,
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

export const deleteRMQServer = () => (dispatch) => {
  dispatch({
    type: CLEAR_RMQ_MESSAGES,
  });
  dispatch({
    type: CLEAR_ERRORS,
  });

  axios
    .post("/api/rabbitmq/user/deleteRMQServer")
    .then((res) => {
      dispatch({
        type: DELETE_RMQ_SERVER,
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

export const createProducer = () => (dispatch) => {
  dispatch({
    type: CLEAR_RMQ_MESSAGES,
  });
  dispatch({
    type: CLEAR_ERRORS,
  });

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

export const createConsumer = (consumerData) => (dispatch) => {
  dispatch({
    type: CLEAR_RMQ_MESSAGES,
  });
  dispatch({
    type: CLEAR_ERRORS,
  });

  axios
    .post("/api/rabbitmq/user/consumerCreate", consumerData)
    .then((res) => {
      dispatch({
        type: CREATE_CONSUMER,
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

export const deleteConsumer = (consumerData) => (dispatch) => {
  dispatch({
    type: CLEAR_RMQ_MESSAGES,
  });
  dispatch({
    type: CLEAR_ERRORS,
  });

  axios
    .post("/api/rabbitmq/user/consumerDelete", consumerData)
    .then((res) => {
      dispatch({
        type: DELETE_CONSUMER,
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

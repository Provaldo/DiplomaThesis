import axios from "axios";
import { GET_MESSAGES, GET_ERRORS } from "./types";

export const createProducer = () => (dispatch) => {
  axios
    .post("/api/rabbitmq/user/producer")
    .then((res) => {
      dispatch({
        type: GET_MESSAGES,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

export const createConsumer = () => (dispatch) => {
  axios
    .post("/api/rabbitmq/user/consumer")
    .then((res) => {
      dispatch({
        type: GET_MESSAGES,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

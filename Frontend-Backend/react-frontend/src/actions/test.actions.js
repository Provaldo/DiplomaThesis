import axios from "axios";
import { GET_ERRORS, GET_RMQ_MESSAGES } from "./types";

export const testFunction = () => (dispatch) => {
  axios
    .post("/api/testFunction", { timeframe: 300, intervals: 15 })
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
    });
};

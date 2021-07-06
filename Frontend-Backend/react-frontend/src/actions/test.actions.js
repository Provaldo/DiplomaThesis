import axios from "axios";
import { GET_ERRORS } from "./types";

export const testFunction = () => (dispatch) => {
  axios
    .get("/api/testFunction")
    .then(() => {})
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

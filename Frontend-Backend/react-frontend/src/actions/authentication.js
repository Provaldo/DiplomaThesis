import axios from "axios";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
// import setAuthToken from "../setAuthToken";
// import jwt_decode from "jwt-decode";

export const registerUser = (user, history) => (dispatch) => {
  axios
    // .post("/api/users/register", user)
    .post("/api/auth/signup", user)
    .then((res) => {
      history.push("/login");
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

export const loginUser = (user) => (dispatch) => {
  axios
    // .post("/api/users/login", user)
    .post("/api/auth/signin", user)
    .then((res) => {
      // No need for that because I'm doing authentication by session cookies
      // const { token } = res.data;
      // localStorage.setItem("jwtToken", token);
      // setAuthToken(token);
      // const decoded = jwt_decode(token);
      // dispatch(setCurrentUser(decoded));
      dispatch(setCurrentUser(res.data.id));
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

export const logoutUser = (history) => (dispatch) => {
  // No need for that because I'm doing authentication by session cookies
  // localStorage.removeItem("jwtToken");
  // setAuthToken(false);
  // dispatch(setCurrentUser({}));
  // history.push("/login");
  axios
    .get("/api/auth/signout")
    .then((res) => {
      dispatch(setCurrentUser({}));
      history.push("/login");
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};

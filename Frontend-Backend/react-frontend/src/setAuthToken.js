// I won't be needing this because I'm doing authentication via session cookies

import axios from "axios";

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;

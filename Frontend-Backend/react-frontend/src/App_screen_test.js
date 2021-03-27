import React, { Component, useState, useEffect } from "react";

import axios from "axios";

const App = (props) => {
  const [credentials, setCredentials] = useState({});
  const [screen, setScreen] = useState();

  useEffect(() => {
    axios
      .get("/register")
      .then(function (response) {
        console.log("Oh yeah I got it\n");
        setScreen(response.data);
      })
      .catch(function (error) {
        console.log("A horrendous error has occured:\n", error);
      })
      .then(function () {
        // always executed
      });
  }, []);

  // return    <div className="container">{screen}</div>;
  return { screen };
};

export default App;

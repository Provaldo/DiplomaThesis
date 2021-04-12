import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// // older implementation
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );

// TESTING THE NEWEST INDEX.JS
import configureStore from "./store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { checkLoggedIn } from "./util/session";

const renderApp = (preloadedState) => {
  const store = configureStore(preloadedState);
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    document.getElementById("root")
  );

  // FOR TESTING, REMOVE BEFORE PRODUCTION
  // window.getState = store.getState;
};

(async () => renderApp(await checkLoggedIn()))();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/* ANOTHER ARCHITECTURE STYLE. NOT RELEVANT NOW
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";

import axios from 'axios';

function View (props) {
  const { screen, setScreen } = props;

  const [data, setData] = useState();

  const deleteCookie = async () => {
    try {
      await axios.get('/clear-cookie');
      setScreen('auth');
    } catch (e) {
      console.log(e);
    }
  };

  const getData = async () => {
    try {
      const res = await axios.get('/get-data');
      console.log(res.data)
      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <p>{screen}</p>
      <p>{data}</p>
      //<button onClick={getData}>Get Data</button>
      <button onClick={deleteCookie}>Logout</button>
    </div>
  );
}

function App() {

  const [screen, setScreen] = useState('auth');
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const auth = async () => {
    try {
      const res = await axios.get('/authenticate', { auth: { username, password } });

      if (res.data.screen !== undefined) {
        setScreen(res.data.screen);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const readCookie = async () => {
    try {
      const res = await axios.get('/read-cookie');
      
      if (res.data.screen !== undefined) {
        setScreen(res.data.screen);
      }
    } catch (e) {
      setScreen('auth');
      console.log(e);
    }
  };

  useEffect(() => {
    readCookie();
  }, []);

  return (
    <div className="App">
      {screen === 'auth'
        ? <div>
            <label>Username: </label>
            <br/>
            <input type="text" onChange={e => setUsername(e.target.value)} />
            <br/>
            <label>Password: </label>
            <br/>
            <input type="password" onChange={e => setPassword(e.target.value)} />
            <br/>
            <button onClick={auth}>Login</button>
          </div>
        : <View screen={screen} setScreen={setScreen} />
      }
    </div>
  );
}

export default App;


const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
*/

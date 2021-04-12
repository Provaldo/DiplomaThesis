import React from "react";
// import { BrowserRouter as Router, Route } from "react-router-dom";
import { Route } from "react-router-dom";
// import { Provider } from "react-redux";
// import store from "./store";
// import configureStore from "./store";
import { AuthRoute, ProtectedRoute } from "./util/route";
// import jwt_decode from "jwt-decode";
// import setAuthToken from "./setAuthToken";
// import { setCurrentUser, logoutUser } from "./actions/authentication";

import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";

import "bootstrap/dist/css/bootstrap.min.css";
import AuthenticatedContent from "./components/AuthenticatedContent";

// This code below will not be used because I'm doing authentication by session cookies
// if (localStorage.jwtToken) {
//   setAuthToken(localStorage.jwtToken);
//   const decoded = jwt_decode(localStorage.jwtToken);
//   store.dispatch(setCurrentUser(decoded));

//   const currentTime = Date.now() / 1000;
//   if (decoded.exp < currentTime) {
//     store.dispatch(logoutUser());
//     window.location.href = "/login";
//   }
// }

// The two lines below are a more proper implementation (I think) that I found here: https://itnext.io/mastering-session-authentication-aa29096f6e22
// let preloadedState = {};
// const store = configureStore(preloadedState);

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <div>
//           <Navbar />
//           <Route exact path="/" component={Home} />
//           {/* <div className="container"> */}
//           {/* <Route exact path="/register" component={Register} /> */}
//           <AuthRoute path="/register" component={Register} />
//           {/* <Route exact path="/login" component={Login} /> */}
//           <AuthRoute path="/login" component={Login} />
//           {/* <Route exact path="/authenticated" component={AuthenticatedContent} /> */}
//           <ProtectedRoute
//             path="/authenticated"
//             component={AuthenticatedContent}
//           />
//           {/* </div> */}
//         </div>
//       </Router>
//     </Provider>
//   );
// }

// export default App;

// // FOR TESTING, remove before production
// window.getState = store.getState;

// TESTING THE NEWEST APP.JS
const App = () => (
  <>
    <Navbar />
    <Route exact path="/" component={Home} />
    <AuthRoute path="/register" component={Register} />
    <AuthRoute path="/login" component={Login} />
    <ProtectedRoute path="/authenticated" component={AuthenticatedContent} />
  </>
);

export default App;

/*
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

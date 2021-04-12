// import { createStore, applyMiddleware, compose } from "redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

// const inititalState = {};

// This was the solution proposed here: https://github.com/bradtraversy/redux_crash_course/issues/2
// I took the important part and embedded it to the createStore() function below.
// const createStoreWithMiddleware = createStore(
//   rootReducers,
//   compose(
//     applyMiddleware(thunk, logger),
//     window.navigator.userAgent.includes("Chrome")
//       ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
//           window.__REDUX_DEVTOOLS_EXTENSION__()
//       : compose
//   )
// );

// I was using this one until I found the last one below
// const store = createStore(
//   rootReducer,
//   inititalState,
//   // This was the original compose() function. I replaced it with the one below
//   // compose(
//   //   applyMiddleware(thunk),
//   //   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
//   // )
//   compose(
//     applyMiddleware(thunk)
//     // commenting this one out entirely seems to have fixed the probllem
//     // window.navigator.userAgent.includes("Chrome")
//     //   ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
//     //       window.__REDUX_DEVTOOLS_EXTENSION__()
//     //   : compose
//   )
// );

// export default store;

// This was a more proper implementation (I think) that I found here: https://itnext.io/mastering-session-authentication-aa29096f6e22
export default (function (preloadedState) {
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk)
  );
  return store;
});

// const store = createStore

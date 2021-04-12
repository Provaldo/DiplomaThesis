import { GET_ERRORS, CLEAR_ERRORS, SET_CURRENT_USER } from "../actions/types";

const initialState = {};

// // This was the original reducer from the source: https://www.designmycodes.com/react/reactjs-redux-nodejs-mongodb-jwt-authentication-tutorial.html
// export default (function (state = initialState, action) {
//   switch (action.type) {
//     case GET_ERRORS:
//       return action.payload;
//     default:
//       return state;
//   }
// });

// This was a more proper implementation (I think) that I found here: https://itnext.io/mastering-session-authentication-aa29096f6e22
export default (function (state = initialState, { type, payload }) {
  Object.freeze(state);
  switch (type) {
    case GET_ERRORS:
      return payload;
    // when we receive our current user, we also clear errors. This is often how you’ll see different actions triggering different parts of the state.
    case SET_CURRENT_USER:
    case CLEAR_ERRORS:
      return initialState;
    default:
      return state;
  }
});

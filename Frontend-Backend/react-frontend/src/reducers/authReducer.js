import {
  SET_CURRENT_USER,
  LOGOUT_CURRENT_USER,
  CREATE_RMQ_SERVER,
  DELETE_RMQ_SERVER,
  CREATE_CONSUMER,
  DELETE_CONSUMER,
  DELETE_ALL_CONSUMERS,
} from "../actions/types";
import isEmpty from "../is-empty";

const _nullUser = {
  // This is so tha we can always call user.{field} on our user object and not error out if there isn't a user logged in
  id: null,
  username: null,
  email: null,
  roles: null,
  rabbitmqServer: null,
  consumers: null,
};

const initialState = {
  isAuthenticated: false,
  user: _nullUser,
};

// // This was the original reducer from the source: https://www.designmycodes.com/react/reactjs-redux-nodejs-mongodb-jwt-authentication-tutorial.html
// export default (function (state = initialState, action) {
//   switch (action.type) {
//     case SET_CURRENT_USER:
//       return {
//         ...state,
//         isAuthenticated: !isEmpty(action.payload),
//         user: action.payload,
//       };
//     default:
//       return state;
//   }
// });

// This was a more proper implementation (I think) that I found here: https://itnext.io/mastering-session-authentication-aa29096f6e22
export default (function (state = initialState, { type, payload }) {
  // We also freeze the state, which prevents any accidental mutation and lets others know when they are working with our code to, “BACK OFF!”
  // Just kidding. But it makes it clear.
  Object.freeze(state);
  switch (type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(payload),
        user: payload,
      };
    case LOGOUT_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: false,
        user: _nullUser,
      };
    case CREATE_RMQ_SERVER:
      return {
        ...state,
        user: { ...state.user, rabbitmqServer: payload.serverData },
      };
    case DELETE_RMQ_SERVER:
      return {
        ...state,
        user: { ...state.user, rabbitmqServer: {} },
      };
    case CREATE_CONSUMER:
      return {
        ...state,
        user: {
          ...state.user,
          consumers: [...state.user.consumers, payload.consumerData],
        },
      };
    case DELETE_CONSUMER:
      let tempConsumersArray = state.user.consumers;
      // The Array.prototype.findIndex() method returns an index in the array if an element
      // in the array satisfies the provided testing function; otherwise, it will return -1,
      // which indicates that no element passed the test. It executes the callback function
      // once for every index in the array until it finds the one where callback returns true.
      const index = tempConsumersArray.findIndex((element) => {
        if (element.name === payload.consumerName) {
          return true;
        }
      });
      if (index > -1) {
        tempConsumersArray.splice(index, 1);
      } else {
        console.log(
          "Unknown consumer name: consumerName returned from backend is not found in user's list of consumers in frontend's object"
        );
      }
      return {
        ...state,
        user: {
          ...state.user,
          consumers: tempConsumersArray,
        },
      };
    case DELETE_ALL_CONSUMERS:
      return {
        ...state,
        user: { ...state.user, consumers: [] },
      };
    default:
      return state;
  }
});

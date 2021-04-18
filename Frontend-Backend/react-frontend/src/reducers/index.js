import { combineReducers } from "redux";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";
import rabbitmqReducer from "./rabbitmqReducer";

export default combineReducers({
  errors: errorReducer,
  auth: authReducer,
  rabbitmq: rabbitmqReducer,
});

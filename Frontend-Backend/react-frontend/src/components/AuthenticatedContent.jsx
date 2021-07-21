import React, { useState, useRef, useEffect } from "react";
import "./components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { testFunction } from "../actions/test.actions";
import RMQServer from "./AuthenticatedContentComponents/RMQServer";
import RMQConsumers from "./AuthenticatedContentComponents/RMQConsumers";
import RMQProducer from "./AuthenticatedContentComponents/RMQProducer";

const AuthenticatedContent = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
    errors: {},
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      if (props.errors) {
        setState((s) => {
          return { ...s, errors: props.errors };
        });
      }
    } else {
      isMounted.current = true;
    }
  }, [props.errors]);

  // useEffect(() => {
  //   if (!props.auth.isAuthenticated) {
  //     props.history.push("/login");
  //   }
  // }, [props.auth.isAuthenticated, props.history]);

  const { id, username, email, roles, rabbitmqServer, consumers } =
    props.auth.user;

  useEffect(() => {
    if (
      typeof rabbitmqServer !== "undefined" &&
      rabbitmqServer !== null &&
      Object.keys(rabbitmqServer).length !== 0
    ) {
      setState((s) => {
        return { ...s, rmqServerExists: true };
      });
    } else {
      setState((s) => {
        return { ...s, rmqServerExists: false };
      });
    }
  }, [rabbitmqServer]);

  const { errors } = state;
  return (
    <div className="App">
      <header className="Auth-header">
        <div>Authenticated Content</div>
      </header>
      <br />
      <div className="Auth-container">
        <ul>
          <li>Id: {id}</li>
          <li>username: {username}</li>
          <li>email: {email}</li>
          <li>roles: {roles}</li>
          {/* #########################################################################################################
###########################                       RABBITMQ SERVER                             #########################
####################################################################################################################### */}
          <li>
            <RMQServer />
          </li>
          {/* #########################################################################################################
###########################                       CONSUMERS                                   #########################
####################################################################################################################### */}
          {state.rmqServerExists && (
            <li>
              <RMQConsumers />
            </li>
          )}
          {/* #########################################################################################################
###########################                       PRODUCER                                   ##########################
####################################################################################################################### */}
          {state.rmqServerExists && (
            <li>
              <RMQProducer />
            </li>
          )}
          <li>
            {props.rabbitmq.message && <h6>{props.rabbitmq.message}</h6>}
            {errors.message && <h6>{errors.message}</h6>}
            <button onClick={props.testFunction}>Test Button</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

AuthenticatedContent.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  testFunction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  testFunction,
})(AuthenticatedContent);

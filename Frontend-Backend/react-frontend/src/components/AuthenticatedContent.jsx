// import React, { useState, useEffect } from "react";
import React, { useState, useRef, useEffect } from "react";
import "./components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  createRMQServer,
  deleteRMQServer,
  createProducer,
  createConsumer,
} from "../actions/rabbitmq.actions";
import { testFunction } from "../actions/test.actions";
import classnames from "classnames";

const AuthenticatedContent = (props) => {
  const [state, setState] = useState({
    rmq_username: props.auth.user.username,
    rmq_password: "",
    rmqServerExists: false,
    errors: {},
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      if (props.errors) {
        // setState({ ...state, errors: props.errors });
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
    // This is just a test of whether the object 'rabbitmqServer' is an empty object or not
    if (rabbitmqServer.deploymentName) {
      setState((s) => {
        return { ...s, rmqServerExists: true };
      });
    } else {
      setState((s) => {
        return { ...s, rmqServerExists: false };
      });
    }
  }, [rabbitmqServer]);

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onRMQServerCreationRequest = (e) => {
    e.preventDefault();
    const credentials = {
      rmq_username: state.rmq_username,
      rmq_password: state.rmq_password,
    };
    props.createRMQServer(credentials);
  };

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
          <li className="RMQ-server-container">
            <div>rabbitmqServer: </div>
            <div>
              {rabbitmqServer.deploymentName &&
                `name: ${rabbitmqServer.deploymentName}`}
            </div>
            <div>
              {rabbitmqServer.creationTimestamp &&
                `created at: ${rabbitmqServer.creationTimestamp}`}
            </div>
            <div>
              {rabbitmqServer.managementAddress &&
                `address: ${rabbitmqServer.managementAddress}`}
            </div>
            <div>
              {rabbitmqServer.managementAddressNodePort &&
                `nodePort: ${rabbitmqServer.managementAddressNodePort}`}
            </div>
            <div>
              {rabbitmqServer.managementAddress && (
                <a
                  href={`http://${rabbitmqServer.managementAddress}`}
                  target="_blank"
                  rel="noopener noreferrer" // there is a major security flaw with target = "_blank". That's why I added this part. https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
                >
                  Open RabbitMQ Management UI in a new Tab
                </a>
              )}
            </div>
            {!state.rmqServerExists && (
              <form onSubmit={onRMQServerCreationRequest}>
                <h6>Request RabbitMQ Server: </h6>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="RMQ Server Username"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.rmq_username,
                    })}
                    name="rmq_username"
                    onChange={handleInputChange}
                    value={state.rmq_username}
                  />
                  {errors.rmq_username && (
                    <div className="invalid-feedback">
                      {errors.rmq_username}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="RMQ Server Password"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.rmq_password,
                    })}
                    name="rmq_password"
                    onChange={handleInputChange}
                    value={state.rmq_password}
                  />
                  {errors.rmq_password && (
                    <div className="invalid-feedback">
                      {errors.rmq_password}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !(
                        Boolean(state.rmq_username) &&
                        Boolean(state.rmq_password)
                      ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
                    }
                  >
                    Create RabbitMQ Server
                  </button>
                </div>
              </form>
            )}
            {state.rmqServerExists && (
              <button
                className="btn btn-danger"
                onClick={props.deleteRMQServer}
              >
                Delete RabbitMQ Server
              </button>
            )}
          </li>
          <li>
            consumers:{" "}
            {consumers &&
              consumers.map((consumer) => {
                return `name: ${consumer.name}, topic: ${consumer.topic}, id: ${consumer.id}`;
              })}
          </li>
        </ul>
        <div>
          <button onClick={props.createProducer}>Create Producer</button>
          <button onClick={props.createConsumer}>Create Consumer</button>
          {props.rabbitmq.message && <h6>{props.rabbitmq.message}</h6>}
          {errors.message && <h6>{errors.message}</h6>}
          <button onClick={props.testFunction}>Test Button</button>
        </div>
      </div>
    </div>
  );
};

AuthenticatedContent.propTypes = {
  // loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  createRMQServer: PropTypes.func.isRequired,
  deleteRMQServer: PropTypes.func.isRequired,
  createConsumer: PropTypes.func.isRequired,
  createProducer: PropTypes.func.isRequired,
  testFunction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  createRMQServer,
  deleteRMQServer,
  createProducer,
  createConsumer,
  testFunction,
})(AuthenticatedContent);

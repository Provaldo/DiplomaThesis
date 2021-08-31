import React, { useState, useRef, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  createRMQServer,
  deleteRMQServer,
} from "../../actions/rabbitmq.actions";
import classnames from "classnames";

const RMQServer = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
    rmqConsumerExists: false,
    rmqServerPassword: "",
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

  const { username, rabbitmqServer, consumers } = props.auth.user;

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

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

  useEffect(() => {
    if (
      typeof consumers !== "undefined" &&
      consumers !== null &&
      Object.keys(consumers).length !== 0
    ) {
      setState((s) => {
        return { ...s, rmqConsumerExists: true };
      });
    } else {
      setState((s) => {
        return { ...s, rmqConsumerExists: false };
      });
    }
  }, [consumers]);

  const onRMQServerCreationRequest = (e) => {
    e.preventDefault();
    const serverData = {
      password: state.rmqServerPassword,
      username: username,
    };
    setState((s) => {
      return {
        ...s,
        rmqServerPassword: "",
      };
    });
    props.createRMQServer(serverData);
  };

  const { errors } = state;
  return (
    <div className="RMQ-server-container">
      <div>rabbitmqServer: </div>
      <div>
        {state.rmqServerExists && `name: ${rabbitmqServer.deploymentName}`}
      </div>
      <div>
        {state.rmqServerExists &&
          `created at: ${rabbitmqServer.creationTimestamp}`}
      </div>
      <div>
        {state.rmqServerExists &&
          `address to receive messages: ${rabbitmqServer.addressIP}:${rabbitmqServer.amqpAddressPort}`}
      </div>
      {/* <div>
              {state.rmqServerExists &&
                `nodePort: ${rabbitmqServer.managementAddressNodePort}`}
            </div> */}
      <div>
        {state.rmqServerExists && (
          <a
            href={`http://${rabbitmqServer.addressIP}:${rabbitmqServer.managementAddressPort}`}
            target="_blank"
            rel="noopener noreferrer" // there is a major security flaw with target = "_blank". That's why I added this part. https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
          >
            Open RabbitMQ Management UI in a new Tab
          </a>
        )}
      </div>
      {!state.rmqServerExists && (
        <div className="form-group">
          <h6>Request RabbitMQ Server: </h6>
          <h6>
            Please provide your password, for the consumer to be able to connect
            to the RabbitMQ server:
          </h6>
          <input
            type="password"
            placeholder="Password"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqServerPassword,
            })}
            name="rmqServerPassword"
            onChange={handleInputChange}
            value={state.rmqServerPassword}
          />
          {errors.rmqServerPassword && (
            <div className="invalid-feedback">{errors.rmqServerPassword}</div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRMQServerCreationRequest}
            disabled={!Boolean(state.rmqServerPassword)}
          >
            Create RabbitMQ Server
          </button>
        </div>
      )}
      {state.rmqServerExists && (
        <button
          className="btn btn-danger"
          disabled={state.rmqConsumerExists}
          onClick={props.deleteRMQServer}
        >
          Delete RabbitMQ Server
        </button>
      )}
      {state.rmqConsumerExists && (
        <h6>
          Message broker CANNOT be deleted without deleting all the active
          filters first.
        </h6>
      )}
    </div>
  );
};

RMQServer.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  createRMQServer: PropTypes.func.isRequired,
  deleteRMQServer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  createRMQServer,
  deleteRMQServer,
})(RMQServer);

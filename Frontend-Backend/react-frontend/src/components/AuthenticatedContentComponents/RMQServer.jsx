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
    <div
      style={{
        margin: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {state.rmqServerExists && (
        <div>
          <h5
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "center",
            }}
          >
            Existing Message Broker:
          </h5>
          <h5>{`Name: ${rabbitmqServer.deploymentName}`}</h5>
          <h5>
            {`Created on: ${new Date(
              rabbitmqServer.creationTimestamp
            ).toLocaleString()}`}
          </h5>
          {/* <div>
        {state.rmqServerExists &&
          `Message Broker can receive messages\non the following address: ${rabbitmqServer.amq}:${rabbitmqServer.amqpAddressPort}`}
      </div> */}
          <h5 style={{ whiteSpace: "pre" }}>
            {`Message Broker can receive messages\non the following address: 192.168.49.2:${rabbitmqServer.amqpAddressNodePort}`}
          </h5>
          {/* <div>
              {state.rmqServerExists &&
                `nodePort: ${rabbitmqServer.managementAddressNodePort}`}
            </div> */}
          <div>
            <a
              // href={`http://${rabbitmqServer.addressIP}:${rabbitmqServer.managementAddressPort}`}
              href={`http://192.168.49.2:${rabbitmqServer.managementAddressNodePort}`}
              target="_blank"
              rel="noopener noreferrer" // there is a major security flaw with target = "_blank". That's why I added this part. https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
            >
              Open RabbitMQ Management UI in a new Tab
            </a>
          </div>
          <button
            className="btn btn-danger"
            disabled={state.rmqConsumerExists}
            onClick={props.deleteRMQServer}
          >
            Delete RabbitMQ Server
          </button>
          <h6 style={{ marginTop: 10 }}>
            *Message broker CANNOT be deleted without deleting all the active
            filters first.
          </h6>
        </div>
      )}
      {!state.rmqServerExists && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "flex-start",
            alignItems: "flex-start",
            // borderStyle: "solid",
            // borderWidth: 1,
            // borderColor: "red",
          }}
        >
          <h6>Request the creation of a personal Message Broker: </h6>
          <h6
            style={{ whiteSpace: "pre" }}
          >{`Please provide your account password, for the filters\nto be able to connect to the Message Broker:`}</h6>
          <input
            type="password"
            placeholder="Password"
            className={classnames({
              "is-invalid": errors.rmqServerPassword,
            })}
            name="rmqServerPassword"
            onChange={handleInputChange}
            value={state.rmqServerPassword}
            style={{ width: "100%" }}
          />
          {errors.rmqServerPassword && (
            <div className="invalid-feedback">{errors.rmqServerPassword}</div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRMQServerCreationRequest}
            disabled={!Boolean(state.rmqServerPassword)}
            style={{ marginTop: 10, width: "100%" }}
          >
            Create RabbitMQ Server
          </button>
        </div>
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

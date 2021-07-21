import React, { useState, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  createRMQServer,
  deleteRMQServer,
} from "../../actions/rabbitmq.actions";

const RMQServer = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
  });

  const { rabbitmqServer } = props.auth.user;

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
          `address to receive messages: ${rabbitmqServer.managementAddressIP}:5672`}
      </div>
      {/* <div>
              {state.rmqServerExists &&
                `nodePort: ${rabbitmqServer.managementAddressNodePort}`}
            </div> */}
      <div>
        {state.rmqServerExists && (
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
        <div className="form-group">
          <h6>Request RabbitMQ Server: </h6>
          <button
            type="button"
            className="btn btn-primary"
            onClick={props.createRMQServer}
          >
            Create RabbitMQ Server
          </button>
        </div>
      )}
      {state.rmqServerExists && (
        <button className="btn btn-danger" onClick={props.deleteRMQServer}>
          Delete RabbitMQ Server
        </button>
      )}
    </div>
  );
};

RMQServer.propTypes = {
  auth: PropTypes.object.isRequired,
  createRMQServer: PropTypes.func.isRequired,
  deleteRMQServer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  createRMQServer,
  deleteRMQServer,
})(RMQServer);

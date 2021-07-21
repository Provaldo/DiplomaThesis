import React, { useState, useRef, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createProducer } from "../../actions/rabbitmq.actions";
import classnames from "classnames";

const RMQProducer = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
    rmqProducerExchangeName: "",
    rmqProducerTopic: "",
    rmqProducerMessageObject: {},
    rmqProducerKey: "",
    rmqProducerValue: "",
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

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onRMQProducerCreationRequest = (e) => {
    e.preventDefault();
    const producerData = {
      rmqProducerTopic: state.rmqProducerTopic,
      rmqProducerExchangeName: state.rmqProducerExchangeName,
      rmqProducerMessageObject: state.rmqProducerMessageObject,
    };
    setState((s) => {
      return {
        ...s,
        rmqProducerTopic: "",
        rmqProducerExchangeName: "",
        rmqProducerMessageObject: {},
      };
    });
    props.createProducer(producerData);
  };

  const addProducerKeyValuePair = () => {
    let tempObj = state.rmqProducerMessageObject;
    tempObj[state.rmqProducerKey] = state.rmqProducerValue;
    setState((s) => {
      return {
        ...s,
        rmqProducerMessageObject: tempObj,
        rmqProducerKey: "",
        rmqProducerValue: "",
      };
    });
  };

  const onProducerKeyValuePairDeletionRequest = (key) => {
    let tempObj = state.rmqProducerMessageObject;
    delete tempObj[key];
    setState((s) => {
      return { ...s, rmqProducerMessageObject: tempObj };
    });
  };

  const { errors } = state;
  return (
    <form onSubmit={onRMQProducerCreationRequest}>
      <h6>Request RabbitMQ Producer: </h6>
      <div className="form-group">
        <input
          type="text"
          placeholder="Producer Exchange Name"
          className={classnames("form-control form-control-lg", {
            "is-invalid": errors.rmqProducerExchangeName,
          })}
          name="rmqProducerExchangeName"
          onChange={handleInputChange}
          value={state.rmqProducerExchangeName}
        />
        {errors.rmqProducerExchangeName && (
          <div className="invalid-feedback">
            {errors.rmqProducerExchangeName}
          </div>
        )}
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Producer Message Topic"
          className={classnames("form-control form-control-lg", {
            "is-invalid": errors.rmqProducerTopic,
          })}
          name="rmqProducerTopic"
          onChange={handleInputChange}
          value={state.rmqProducerTopic}
        />
        {errors.rmqProducerTopic && (
          <div className="invalid-feedback">{errors.rmqProducerTopic}</div>
        )}
      </div>
      {Boolean(Object.keys(state.rmqProducerMessageObject).length) &&
        Object.keys(state.rmqProducerMessageObject).map((key) => {
          return (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>{`${key}: ${state.rmqProducerMessageObject[key]}`}</div>
              <button
                className="btn btn-danger"
                onClick={() => onProducerKeyValuePairDeletionRequest(key)}
              >
                Remove Key-Value Pair
              </button>
            </div>
          );
        })}
      <div className="form-group">
        <input
          type="text"
          placeholder="Message Key"
          className={classnames("form-control form-control-lg", {
            "is-invalid": errors.rmqProducerKey,
          })}
          name="rmqProducerKey"
          onChange={handleInputChange}
          value={state.rmqProducerKey}
        />
        {errors.rmqProducerKey && (
          <div className="invalid-feedback">{errors.rmqProducerKey}</div>
        )}
        <input
          type="text"
          placeholder="Message Value"
          className={classnames("form-control form-control-lg", {
            "is-invalid": errors.rmqProducerValue,
          })}
          name="rmqProducerValue"
          onChange={handleInputChange}
          value={state.rmqProducerValue}
        />
        {errors.rmqProducerValue && (
          <div className="invalid-feedback">{errors.rmqProducerValue}</div>
        )}
        <button
          type="button"
          className="btn btn-primary"
          disabled={
            !(Boolean(state.rmqProducerKey) && Boolean(state.rmqProducerValue)) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
          }
          onClick={addProducerKeyValuePair}
        >
          Add Key-Value Pair to Producer Message
        </button>
      </div>
      <div className="form-group">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            !(
              Boolean(state.rmqProducerExchangeName) &&
              Boolean(state.rmqProducerTopic) &&
              Boolean(Object.keys(state.rmqProducerMessageObject).length)
            ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
          }
        >
          Create Producer
        </button>
      </div>
    </form>
  );
};

RMQProducer.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  createProducer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  createProducer,
})(RMQProducer);

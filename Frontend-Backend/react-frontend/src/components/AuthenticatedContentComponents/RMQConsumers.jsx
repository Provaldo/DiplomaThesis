import React, { useState, useRef, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createConsumer, deleteConsumer } from "../../actions/rabbitmq.actions";
import classnames from "classnames";
import Select from "react-select";

const operatorOptions = [
  { value: "=", label: "=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: "!=", label: "!=" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
];

const RMQConsumers = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
    rmqConsumerExists: false,
    rmqConsumerName: "",
    rmqRoutingKey: "",
    rmqExchangeName: "",
    rmqLoggingConditionsVariable: "",
    rmqLoggingConditionsOperator: "",
    rmqLoggingConditionsValue: "",
    rmqLoggingConditions: [],
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

  const { rabbitmqServer, consumers } = props.auth.user;

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

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption) => {
    setState((s) => {
      return { ...s, rmqLoggingConditionsOperator: selectedOption };
    });
  };

  const onRMQConsumerCreationRequest = (e) => {
    e.preventDefault();
    const consumerData = {
      rmqConsumerName: state.rmqConsumerName,
      rmqRoutingKey: state.rmqRoutingKey,
      rmqExchangeName: state.rmqExchangeName,
      rmqLoggingConditions: JSON.stringify(state.rmqLoggingConditions),
    };
    setState((s) => {
      return {
        ...s,
        rmqConsumerName: "",
        rmqRoutingKey: "",
        rmqExchangeName: "",
        rmqLoggingConditions: [],
      };
    });
    props.createConsumer(consumerData);
  };

  const onRMQConsumerDeletionRequest = (rmqConsumerName) => {
    const consumerData = {
      rmqConsumerName,
    };
    props.deleteConsumer(consumerData);
  };

  const applyLoggingCondition = () => {
    let tempArray = state.rmqLoggingConditions;
    tempArray.push({
      variable: state.rmqLoggingConditionsVariable,
      operator: state.rmqLoggingConditionsOperator.value,
      value: state.rmqLoggingConditionsValue,
    });
    setState((s) => {
      return {
        ...s,
        rmqLoggingConditions: tempArray,
        rmqLoggingConditionsVariable: "",
        rmqLoggingConditionsOperator: "",
        rmqLoggingConditionsValue: "",
      };
    });
  };

  const onRMQLoggingConditionDeletionRequest = (index) => {
    let tempArray = state.rmqLoggingConditions;
    tempArray.splice(index, 1);
    setState((s) => {
      return { ...s, rmqLoggingConditions: tempArray };
    });
  };

  const { errors } = state;
  return (
    <div lassName="RMQ-consumer-container">
      <div>consumers: </div>
      {state.rmqConsumerExists &&
        consumers.map((consumer) => {
          return (
            <div>
              <div>{`-name: ${consumer.name}`}</div>
              <ul>
                <li>{`exchange name: ${consumer.exchangeName}`}</li>
                <li>{`routing key: ${consumer.routingKey}`}</li>
                <li>
                  logging conditions:{" "}
                  {consumer.loggingConditions.map((condition) => {
                    return (
                      <div>{`${condition.variable} ${condition.operator} ${condition.value}`}</div>
                    );
                  })}
                </li>
                <li>{`created at: ${consumer.creationTimestamp}`}</li>
              </ul>
              <button
                className="btn btn-danger"
                onClick={() => onRMQConsumerDeletionRequest(consumer.name)}
              >
                Delete Consumer
              </button>
            </div>
          );
        })}
      <form onSubmit={onRMQConsumerCreationRequest}>
        <h6>Request RabbitMQ Consumer: </h6>
        <div className="form-group">
          <input
            type="text"
            placeholder="Consumer Name"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqConsumerName,
            })}
            name="rmqConsumerName"
            onChange={handleInputChange}
            value={state.rmqConsumerName}
          />
          {errors.rmqConsumerName && (
            <div className="invalid-feedback">{errors.rmqConsumerName}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Exchange Name"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqExchangeName,
            })}
            name="rmqExchangeName"
            onChange={handleInputChange}
            value={state.rmqExchangeName}
          />
          {errors.rmqExchangeName && (
            <div className="invalid-feedback">{errors.rmqExchangeName}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Routing Key"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqRoutingKey,
            })}
            name="rmqRoutingKey"
            onChange={handleInputChange}
            value={state.rmqRoutingKey}
          />
          {errors.rmqRoutingKey && (
            <div className="invalid-feedback">{errors.rmqRoutingKey}</div>
          )}
        </div>
        {Boolean(state.rmqLoggingConditions.length) &&
          state.rmqLoggingConditions.map((condition, index) => {
            return (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div>{`${condition.variable} ${condition.operator} ${condition.value}`}</div>
                <button
                  className="btn btn-danger"
                  onClick={() => onRMQLoggingConditionDeletionRequest(index)}
                >
                  Remove Logging Condition
                </button>
              </div>
            );
          })}
        <h6>Log messages to the DB when:</h6>
        <div className="form-group">
          <input
            type="text"
            placeholder="Variable"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqLoggingConditionsVariable,
            })}
            name="rmqLoggingConditionsVariable"
            onChange={handleInputChange}
            value={state.rmqLoggingConditionsVariable}
          />
          {errors.rmqLoggingConditionsVariable && (
            <div className="invalid-feedback">
              {errors.rmqLoggingConditionsVariable}
            </div>
          )}
          <Select
            className={classnames("basic-single", {
              "is-invalid": errors.rmqLoggingConditionsOperator,
            })}
            classNamePrefix="select"
            defaultValue={operatorOptions[0]}
            isClearable="true"
            name="rmqLogginConditionsOperator"
            options={operatorOptions}
            onChange={handleSelectChange}
            value={state.rmqLoggingConditionsOperator}
          />
          {errors.rmqLoggingConditionsOperator && (
            <div className="invalid-feedback">
              {errors.rmqLoggingConditionsOperator}
            </div>
          )}
          <input
            type="text"
            placeholder="Value"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqLoggingConditionsValue,
            })}
            name="rmqLoggingConditionsValue"
            onChange={handleInputChange}
            value={state.rmqLoggingConditionsValue}
          />
          {errors.rmqLoggingConditionsValue && (
            <div className="invalid-feedback">
              {errors.rmqLoggingConditionsValue}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !(
                Boolean(state.rmqLoggingConditionsVariable) &&
                Boolean(state.rmqLoggingConditionsOperator) &&
                Boolean(state.rmqLoggingConditionsValue)
              ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
            }
            onClick={applyLoggingCondition}
          >
            Apply Logging Condition
          </button>
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !(
                Boolean(state.rmqConsumerName) &&
                Boolean(state.rmqRoutingKey) &&
                Boolean(state.rmqExchangeName) &&
                Array.isArray(state.rmqLoggingConditions) &&
                state.rmqLoggingConditions.length
              ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
            }
          >
            Create Consumer
          </button>
        </div>
      </form>
    </div>
  );
};

RMQConsumers.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  createConsumer: PropTypes.func.isRequired,
  deleteConsumer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  createConsumer,
  deleteConsumer,
})(RMQConsumers);

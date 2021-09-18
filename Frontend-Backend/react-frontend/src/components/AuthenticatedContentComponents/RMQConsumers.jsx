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
    rmqQueueName: "",
    rmqLoggingConditionsVariable: "",
    rmqLoggingConditionsOperator: "",
    rmqLoggingConditionsValue: "",
    rmqLoggingConditions: [],
    consumerPassword: "",
    errors: {},
  });

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: "1px dotted pink",
      color: state.isSelected ? "blue" : "black",
      padding: 15,
    }),
    control: (provided, state) => ({
      ...provided,
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = "opacity 300ms";

      return { ...provided, opacity, transition };
    },
  };

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
      rmqQueueName: state.rmqQueueName,
      rmqLoggingConditions: JSON.stringify(state.rmqLoggingConditions),
      consumerPassword: state.consumerPassword,
    };
    props.createConsumer(consumerData);
    setState((s) => {
      return {
        ...s,
        rmqConsumerName: "",
        rmqRoutingKey: "",
        rmqExchangeName: "",
        rmqQueueName: "",
        rmqLoggingConditions: [],
        consumerPassword: "",
      };
    });
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
    <div
      style={{
        marginLeft: 20,
        marginRight: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <form
        onSubmit={onRMQConsumerCreationRequest}
        style={{
          display: "flex",
          flexDirection: "column",
          // alignItems: "center",
          flexGrow: 0,
          paddingTop: 20,
          paddingRight: 15,
          borderRightStyle: "solid",
          borderRightWidth: 2,
          borderRightColor: "black",
        }}
      >
        <h3>Apply a custom Filter: </h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Filter Name"
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
            placeholder="Queue Name"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.rmqQueueName,
            })}
            name="rmqQueueName"
            onChange={handleInputChange}
            value={state.rmqQueueName}
          />
          {errors.rmqQueueName && (
            <div className="invalid-feedback">{errors.rmqQueueName}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Binding Key"
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
        <h6>{`Log messages to the DB when the\nfollowing condition is met:`}</h6>
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
            styles={customStyles}
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
            placeholder="Operator"
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
          <h6 style={{ whiteSpace: "pre" }}>
            {`Please provide your password, for the\nproducer to be able to connect to the\nRabbitMQ server:`}
          </h6>
          <input
            type="password"
            placeholder="Password"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.consumerPassword,
            })}
            name="consumerPassword"
            onChange={handleInputChange}
            value={state.consumerPassword}
          />
          {errors.consumerPassword && (
            <div className="invalid-feedback">{errors.consumerPassword}</div>
          )}
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
                Boolean(state.rmqQueueName) &&
                Array.isArray(state.rmqLoggingConditions) &&
                state.rmqLoggingConditions.length &&
                Boolean(state.consumerPassword)
              ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
            }
          >
            Create Filter
          </button>
        </div>
      </form>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginLeft: 15,
        }}
      >
        <h3
          style={{
            alignSelf: "center",
            borderBottomStyle: "solid",
            borderBottomWidth: 2,
            borderColor: "green",
          }}
        >
          Active Filters:{" "}
        </h3>
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {state.rmqConsumerExists &&
            consumers.map((consumer) => {
              return (
                <div style={{ marginRight: 20 }}>
                  <h4>{`- Name: ${consumer.name}`}</h4>
                  <ul>
                    <li>{`Exchange name: ${consumer.exchangeName}`}</li>
                    <li>{`Queue name: ${consumer.queueName}`}</li>
                    <li>{`Binding key: ${consumer.routingKey}`}</li>
                    <li>
                      Logging conditions:{" "}
                      {consumer.loggingConditions.map((condition) => {
                        return (
                          <div>{`${condition.variable} ${condition.operator} ${condition.value}`}</div>
                        );
                      })}
                    </li>
                    <li>{`Created at: ${consumer.creationTimestamp}`}</li>
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
        </div>
      </div>
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

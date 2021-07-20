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
  deleteConsumer,
} from "../actions/rabbitmq.actions";
import { testFunction } from "../actions/test.actions";
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

const AuthenticatedContent = (props) => {
  const [state, setState] = useState({
    rmq_username: props.auth.user.username,
    rmq_password: "",
    rmqServerExists: false,
    rmqConsumerExists: false,
    rmqConsumerName: "",
    rmqRoutingKey: "",
    rmqExchangeName: "",
    rmqLoggingConditionsVariable: "",
    rmqLoggingConditionsOperator: "",
    rmqLoggingConditionsValue: "",
    rmqLoggingConditions: [],
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

  const onRMQServerCreationRequest = (e) => {
    e.preventDefault();
    const credentials = {
      rmq_username: state.rmq_username,
      rmq_password: state.rmq_password,
    };
    setState((s) => {
      return { ...s, rmq_password: "" };
    });
    props.createRMQServer(credentials);
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
          {/* ###################################################################################################################
###########################                                                                   #########################
###########################                       RABBITMQ SERVER                             #########################
###########################                                                                   #########################
####################################################################################################################### */}
          <li className="RMQ-server-container">
            <div>rabbitmqServer: </div>
            <div>
              {state.rmqServerExists &&
                `name: ${rabbitmqServer.deploymentName}`}
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
          {/* ###################################################################################################################
###########################                                                                   #########################
###########################                       CONSUMERS                                   #########################
###########################                                                                   #########################
####################################################################################################################### */}
          {state.rmqServerExists && (
            <li lassName="RMQ-consumer-container">
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
                        onClick={() =>
                          onRMQConsumerDeletionRequest(consumer.name)
                        }
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
                    <div className="invalid-feedback">
                      {errors.rmqConsumerName}
                    </div>
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
                    <div className="invalid-feedback">
                      {errors.rmqExchangeName}
                    </div>
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
                    <div className="invalid-feedback">
                      {errors.rmqRoutingKey}
                    </div>
                  )}
                </div>
                {Boolean(state.rmqLoggingConditions.length) &&
                  state.rmqLoggingConditions.map((condition, index) => {
                    return (
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div>{`${condition.variable} ${condition.operator} ${condition.value}`}</div>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            onRMQLoggingConditionDeletionRequest(index)
                          }
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
            </li>
          )}
          {/* ###################################################################################################################
###########################                                                                   #########################
###########################                       PRODUCER                                   #########################
###########################                                                                   #########################
####################################################################################################################### */}
          <li>
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
                  <div className="invalid-feedback">
                    {errors.rmqProducerTopic}
                  </div>
                )}
              </div>
              {Boolean(Object.keys(state.rmqProducerMessageObject).length) &&
                Object.keys(state.rmqProducerMessageObject).map((key) => {
                  return (
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <div>{`${key}: ${state.rmqProducerMessageObject[key]}`}</div>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          onProducerKeyValuePairDeletionRequest(key)
                        }
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
                  <div className="invalid-feedback">
                    {errors.rmqProducerKey}
                  </div>
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
                  <div className="invalid-feedback">
                    {errors.rmqProducerValue}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    !(
                      Boolean(state.rmqProducerKey) &&
                      Boolean(state.rmqProducerValue)
                    ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
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
                      Boolean(
                        Object.keys(state.rmqProducerMessageObject).length
                      )
                    ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
                  }
                >
                  Create Producer
                </button>
              </div>
            </form>
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
  // loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  createRMQServer: PropTypes.func.isRequired,
  deleteRMQServer: PropTypes.func.isRequired,
  createConsumer: PropTypes.func.isRequired,
  deleteConsumer: PropTypes.func.isRequired,
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
  deleteConsumer,
  testFunction,
})(AuthenticatedContent);

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./modalComponent.css";

const ConsumerMessagesModal = (props) => {
  const [state, setState] = useState({
    messagesExist: false,
  });

  const { messages } = props.rabbitmq;

  useEffect(() => {
    if (
      typeof messages !== "undefined" &&
      messages !== null &&
      Object.keys(messages).length !== 0
    ) {
      setState((s) => {
        return { ...s, messagesExist: true };
      });
    } else {
      setState((s) => {
        return { ...s, messagesExist: false };
      });
    }
  }, [messages]);

  return (
    <div id="myModal" class="modal">
      {/* <!-- Modal content --> */}
      <div class="modal-content">
        <div class="modal-header">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {state.messagesExist ? (
              <h2>{`Filter name: ${messages[0].consumerName}`}</h2>
            ) : (
              <h2>Modal Header</h2>
            )}
          </div>
          <span class="close" onClick={props.closeModal}>
            &times;
          </span>
        </div>
        <div class="modal-body">
          {state.messagesExist ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  width: "90%",
                }}
              >
                <h3>{`Exchange name: ${messages[0].exchangeName}`}</h3>
                <h3>{`Queue name: ${messages[0].queueName}`}</h3>
                <h3>{`Binding key: ${messages[0].bindingKey}`}</h3>
              </div>
              <h3>{`${messages.length} messages were logged to the DB by the Filter`}</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  margin: 15,
                }}
              >
                {messages.map((message) => {
                  let keys = Object.keys(message.content);
                  let content = keys.map((key, index) => (
                    <h5>{`Message content #${index + 1}: ${key}: ${
                      message.content[key]
                    }`}</h5>
                  ));

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        margin: 15,
                        paddingRight: 10,
                        borderRightStyle: "solid",
                        borderRightWidth: 2,
                      }}
                    >
                      {/* <h5>{`Message content: ${message.content}`}</h5> */}
                      <h5>{`Message's routing key: ${message.routingKey}`}</h5>
                      <h5>{`Production timestamp: ${new Date(
                        message.producedAt
                      ).toLocaleString()}`}</h5>
                      <h5>{`Receival timestamp: ${new Date(
                        message.receivedAt
                      ).toLocaleString()}`}</h5>
                      <h5>{`Satisfied condition: ${message.conditionMet.variable} ${message.conditionMet.operator} ${message.conditionMet.value}`}</h5>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <h4> No accepted messages found for this Filter </h4>
          )}
        </div>
        <div class="modal-footer">
          {/* <h3>Modal Footer</h3> */}
          <button onClick={props.closeModal}> Close Modal</button>
        </div>
      </div>
    </div>
  );
};

ConsumerMessagesModal.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  rabbitmq: PropTypes.object.isRequired,
  // createConsumer: PropTypes.func.isRequired,
  // deleteConsumer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {})(ConsumerMessagesModal);

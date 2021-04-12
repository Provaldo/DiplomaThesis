// import React, { useState, useEffect } from "react";
import React from "react";
import "./components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const AuthenticatedContent = (props) => {
  // const [state, setState] = useState();

  // useEffect(() => {
  //   if (!props.auth.isAuthenticated) {
  //     props.history.push("/login");
  //   }
  // }, [props.auth.isAuthenticated, props.history]);

  const {
    id,
    username,
    email,
    roles,
    rabbitmqServers,
    consumers,
  } = props.auth.user;

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
          <li>
            rabbitmqServers:{" "}
            {rabbitmqServers.map((rmq) => {
              return `name: ${rmq.name}, id: ${rmq.id}`;
            })}
          </li>
          <li>
            consumers:{" "}
            {consumers.map((consumer) => {
              return `name: ${consumer.name}, topic: ${consumer.topic}, id: ${consumer.id}`;
            })}
          </li>
        </ul>
        {/* <button>Add RabbitMQ Server</button> */}
      </div>
    </div>
  );
};

AuthenticatedContent.propTypes = {
  // loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {})(AuthenticatedContent);

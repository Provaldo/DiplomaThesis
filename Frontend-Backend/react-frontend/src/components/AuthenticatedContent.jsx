import React, { useState, useRef, useEffect } from "react";
import "./components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { testFunction } from "../actions/test.actions";
import RMQServer from "./AuthenticatedContentComponents/RMQServer";
import RMQConsumers from "./AuthenticatedContentComponents/RMQConsumers";
import RMQProducer from "./AuthenticatedContentComponents/RMQProducer";
import Overview from "./AuthenticatedContentComponents/Overview";

import styled from "styled-components";

const AuthenticatedContent = (props) => {
  const [state, setState] = useState({
    rmqServerExists: false,
    errors: {},
  });

  {
    /* #########################################################################################################
###########################                       TABS CREATION                             #########################
####################################################################################################################### */
  }
  const tabs = [
    "User Info",
    "Overview",
    "Message Broker",
    "Filters",
    "Producers",
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const Tab = styled.button`
    font-size: 20px;
    padding: 10px 60px;
    margin: 0px 3px 0px 3px;
    cursor: pointer;
    opacity: 0.6;
    background: grey;
    border: 0;
    border-radius: 4px;
    outline: 1;
    ${({ active }) =>
      active &&
      `
    border-bottom: 3px solid green;
    opacity: 1;
  `}
  `;

  const ButtonGroup = styled.div`
    display: flex;
  `;

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

  // useEffect(() => {
  //   if (!props.auth.isAuthenticated) {
  //     props.history.push("/login");
  //   }
  // }, [props.auth.isAuthenticated, props.history]);

  const { username, email, roles, rabbitmqServer } = props.auth.user;

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

  const { errors } = state;
  return (
    <div className="App">
      <header className="Auth-header">
        <div>Authenticated Content</div>
      </header>
      <br />

      <ButtonGroup>
        {tabs.map((tab) => (
          <Tab
            className="styled-button-tab"
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </ButtonGroup>

      <div className="Auth-container">
        {/* <p /> */}
        {/* <br /> */}
        {activeTab == "User Info" && (
          <ul>
            <li>username: {username}</li>
            <li>email: {email}</li>
            <li>roles: {roles}</li>{" "}
          </ul>
        )}

        {activeTab == "Overview" && <Overview />}
        {activeTab == "Message Broker" && <RMQServer />}
        {activeTab == "Filters" && state.rmqServerExists && <RMQConsumers />}
        {activeTab == "Producers" && state.rmqServerExists && <RMQProducer />}
      </div>

      <div className="Auth-container">
        <ul>
          <li>
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
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  testFunction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  testFunction,
})(AuthenticatedContent);

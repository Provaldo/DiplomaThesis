import React, { useState, useRef, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getStreamErrors } from "../../actions/rabbitmq.actions";
import classnames from "classnames";

const Overview = (props) => {
  const [state, setState] = useState({
    errors: {},
    streamEvents: null,
    overviewData: {},
    rmqConsumerExists: false,
  });
  const [streaming, setStreaming] = useState(false);

  const { username, rabbitmqServer, consumers } = props.auth.user;

  const startStream = () => {
    try {
      const events = new EventSource("/api/rabbitmq/user/overview");

      // console.log("events: ", events);
      console.log("Starting overview stream");
      setState((s) => {
        return { ...s, streamEvents: events };
      });

      events.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        // console.log("parsedData: ", parsedData);
        setState((s) => {
          return { ...s, overviewData: parsedData };
        });
      };
    } catch (err) {
      getStreamErrors(err);
    }
  };

  const endStream = () => {
    try {
      console.log("Closing stream");
      setStreaming(false);
      state.streamEvents.close();
    } catch (err) {
      getStreamErrors(err);
    }
  };

  useEffect(() => {
    startStream();
    setStreaming(true);
    // return () => {
    //   endStream();
    // };
  }, []);

  const onStreamToggleHandler = () => {
    if (streaming) {
      endStream();
      setStreaming(false);
    } else {
      startStream();
      setStreaming(true);
    }
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

  const { errors } = state;

  return (
    <div>
      {!state.rmqConsumerExists && (
        <h6>
          To watch a live-feed of the system's overview please create an active
          filter/consumer
        </h6>
      )}
      {Object.keys(state.overviewData).map((key, index) => (
        <div>
          <h4 style={{ paddingLeft: 10 }}>{key}</h4>
          {typeof state.overviewData[key] === "number" ? (
            <div style={{ paddingLeft: 30 }}>
              <h6>{state.overviewData[key]}</h6>
            </div>
          ) : Array.isArray(state.overviewData[key]) ? (
            state.overviewData[key].map((element, i) => {
              <div style={{ paddingLeft: 30 }}>
                <h5>{`Exchange name: ${state.overviewData[key][i].exchangeName}`}</h5>
                <h6>{`Average value: ${state.overviewData[key][i].avgValue}`}</h6>
                <h6>{`Average rate: ${state.overviewData[key][element].avgRate}`}</h6>
              </div>;
            })
          ) : (
            typeof state.overviewData[key] !== "undefined" &&
            typeof state.overviewData[key] === "object" && (
              <div style={{ flexDirection: "row", paddingLeft: 30 }}>
                <h6>{`Total messages: ${state.overviewData[key].totalMsgs}`}</h6>
                <h6>{`Average value: ${state.overviewData[key].avgValue}`}</h6>
                <h6>{`Average rate: ${state.overviewData[key].avgRate}`}</h6>
              </div>
            )
          )}
        </div>
      ))}
      {/* <table className="stats-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(state.overviewData).map((key, index) => (
            <tr key={index}>
              <td>{key}</td>
              <td>{state.overviewData[key]}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <button onClick={onStreamToggleHandler}>
        {streaming ? "Stop data stream" : "Start data stream"}
      </button>
    </div>
  );
};

Overview.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  rabbitmq: PropTypes.object.isRequired,
  getStreamErrors: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  getStreamErrors,
})(Overview);

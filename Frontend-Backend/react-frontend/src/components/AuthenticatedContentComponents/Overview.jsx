import React, { useState, useRef, useEffect } from "react";
import "../components.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getStreamErrors,
  endStreamAction,
  setOverviewTimings,
} from "../../actions/rabbitmq.actions";
import classnames from "classnames";
import Select from "react-select";
import OverviewLiveData from "./OverviewLiveData";

const timeframeOptions = [
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 7200, label: "2 hours" },
  { value: 14400, label: "4 hours" },
  { value: 28800, label: "8 hours" },
  { value: 43200, label: "12 hours" },
  { value: 86400, label: "24 hours" },
];

const intervalsOptions = [
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted pink",
    color: state.isSelected ? "blue" : "black",
    padding: 20,
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

const Overview = (props) => {
  const [state, setState] = useState({
    errors: {},
    streamEvents: null,
    overviewData: {},
    rmqConsumerExists: false,
    overviewTimeframe: null,
    overviewIntervals: null,
    invalidSelection: false,
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

      events.addEventListener("endStreamEvent", () => {
        endStream();
      });
    } catch (err) {
      props.getStreamErrors(err);
    }
  };

  const endStream = () => {
    try {
      console.log("Closing stream");
      setStreaming(false);
      // state.streamEvents.close();
      props.endStreamAction(state.streamEvents);
    } catch (err) {
      props.getStreamErrors(err);
    }
  };

  const onStreamToggleHandler = () => {
    if (streaming) {
      endStream();
      setStreaming(false);
    } else {
      let timings = {};
      if (state.overviewTimeframe === null) {
        timings = { timeframe: 120, intervals: 15 }; // default overview timings
      } else {
        timings = {
          timeframe: state.overviewTimeframe, // overview timings set by the user
          intervals: state.overviewIntervals,
        };
      }
      props.setOverviewTimings(timings);
      setTimeout(() => {
        startStream();
        setStreaming(true);
      }, 300);
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

  useEffect(() => {
    // onStreamToggleHandler();
    return () => {
      props.endStreamAction(state.streamEvents);
    };
  }, []);

  const handleSelectTimeframeChange = (selectedOption) => {
    setState((s) => {
      return { ...s, overviewTimeframe: selectedOption };
    });
  };

  const handleSelectIntervalsChange = (selectedOption) => {
    setState((s) => {
      return { ...s, overviewIntervals: selectedOption };
    });
  };

  const applyLOverviewTimings = () => {
    if (state.overviewTimeframe.value < 4 * state.overviewIntervals.value) {
      setState((s) => {
        return { ...s, invalidSelection: true };
      });
    } else {
      setState((s) => {
        return { ...s, invalidSelection: false };
      });

      endStream();

      let timings = {};
      timings = {
        timeframe: state.overviewTimeframe.value, // overview timings set by the user
        intervals: state.overviewIntervals.value,
      };
      props.setOverviewTimings(timings);
      setTimeout(() => {
        startStream();
        setStreaming(true);
      }, 1000);
    }
  };

  const { errors } = state;

  return (
    <div>
      {!state.rmqConsumerExists && (
        <h6>
          To watch a live-feed of the system's overview please create an active
          filter/consumer
        </h6>
      )}
      {state.rmqConsumerExists && (
        <div
          style={{
            display: "flex",
            // flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            margin: 5,
            padding: 20,
            // borderWidth: 2,
            // borderStyle: "solid",
            // borderColor: "green",
          }}
        >
          <button
            onClick={onStreamToggleHandler}
            style={{
              borderWidth: 4,
              borderColor: streaming ? "red" : "green",
              paddingVertical: 25,
              paddingHorizontal: 10,
              flex: 1,
            }}
          >
            {streaming ? "Stop data stream" : "Start data stream"}
          </button>

          <div
            className="form-group"
            style={{
              margin: 15,
            }}
          >
            <h6>
              Set Overview Timeframe and Overview Intervals. (Default Timeframe
              is 120s with 15s Intervals between sampling)
            </h6>
            <Select
              styles={customStyles}
              className="basic-single"
              classNamePrefix="select"
              defaultValue={timeframeOptions[1]}
              isClearable="true"
              name="timeframeOptions"
              options={timeframeOptions}
              onChange={handleSelectTimeframeChange}
              value={state.overviewTimeframe}
              placeholder="Set Timeframe of overview data to be gathered"
            />
            <Select
              styles={customStyles}
              className="basic-single"
              classNamePrefix="select"
              defaultValue={intervalsOptions[0]}
              isClearable="true"
              name="intervalsOptions"
              options={intervalsOptions}
              onChange={handleSelectIntervalsChange}
              value={state.overviewIntervals}
              placeholder="Set Intervals period between samples"
            />
            {state.invalidSelection && (
              <h6>
                Timeframe MUST be at least 4 times as long as the Interval
                period. Please change your selections.
              </h6>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !(
                  Boolean(state.overviewTimeframe) &&
                  Boolean(state.overviewIntervals)
                ) // Typecast the variable to Boolean, where str is a variable. It returns false for null, undefined, 0, 000, "", false. It returns true for string "0" and whitespace " ".
              }
              onClick={applyLOverviewTimings}
              style={{ marginTop: 10 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
      <OverviewLiveData overviewData={state.overviewData} />
    </div>
  );
};

Overview.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  rabbitmq: PropTypes.object.isRequired,
  getStreamErrors: PropTypes.func.isRequired,
  endStreamAction: PropTypes.func.isRequired,
  setOverviewTimings: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  rabbitmq: state.rabbitmq,
});

export default connect(mapStateToProps, {
  getStreamErrors,
  endStreamAction,
  setOverviewTimings,
})(Overview);

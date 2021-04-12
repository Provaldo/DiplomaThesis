import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { registerUser } from "../actions/authentication";
import classnames from "classnames";

const Register = (props) => {
  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    errors: {},
  });

  const isMounted = useRef(false);

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      username: state.username,
      email: state.email,
      password: state.password,
      password_confirm: state.password_confirm,
    };
    props.registerUser(user, props.history);
  };

  // This is no more needed with the implementation of AuthRoutes
  // useEffect(() => {
  //   if (props.auth.isAuthenticated) {
  //     props.history.push("/authenticated");
  //   }
  // }, [props.auth.isAuthenticated, props.history]);

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

  //   componentWillReceiveProps(nextProps) {
  //     if (nextProps.auth.isAuthenticated) {
  //       this.props.history.push("/authenticated");
  //     }
  //     if (nextProps.errors) {
  //       this.setState({
  //         errors: nextProps.errors,
  //       });
  //     }
  //   }

  //   componentDidMount() {
  //     if (this.props.auth.isAuthenticated) {
  //       this.props.history.push("/authenticated");
  //     }
  //   }

  const { errors } = state;
  return (
    <div className="container" style={{ marginTop: "50px", width: "700px" }}>
      <h2 style={{ marginBottom: "40px" }}>Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.username,
            })}
            name="username"
            onChange={handleInputChange}
            value={state.username}
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.email,
            })}
            name="email"
            onChange={handleInputChange}
            value={state.email}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.password,
            })}
            name="password"
            onChange={handleInputChange}
            value={state.password}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            className={classnames("form-control form-control-lg", {
              "is-invalid": errors.password_confirm,
            })}
            name="password_confirm"
            onChange={handleInputChange}
            value={state.password_confirm}
          />
          {errors.password_confirm && (
            <div className="invalid-feedback">{errors.password_confirm}</div>
          )}
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Register User
          </button>
        </div>
      </form>
    </div>
  );
};

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, { registerUser })(withRouter(Register));

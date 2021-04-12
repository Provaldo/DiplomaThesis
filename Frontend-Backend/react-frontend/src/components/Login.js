import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../actions/authentication";
import classnames from "classnames";

const Login = (props) => {
  const [state, setState] = useState({ email: "", password: "", errors: {} });

  const isMounted = useRef(false);

  const handleInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      email: state.email,
      password: state.password,
    };
    props.loginUser(user);
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

  //   componentDidMount() {
  //     if (this.props.auth.isAuthenticated) {
  //       this.props.history.push("/authenticated");
  //     }
  //   }

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

  const { errors } = state;
  return (
    <div className="container" style={{ marginTop: "50px", width: "700px" }}>
      <h2 style={{ marginBottom: "40px" }}>Login</h2>
      <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary">
            Login User
          </button>
        </div>
      </form>
    </div>
  );
};

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, { loginUser })(Login);

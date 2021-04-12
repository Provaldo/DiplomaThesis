// This was a cool implementation (I think) that I found here: https://itnext.io/mastering-session-authentication-aa29096f6e22
import React from "react";
import { connect } from "react-redux";
import { Redirect, Route, withRouter } from "react-router-dom";

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// The protected routes will not allow a logged out user to access them and will redirect them to the login page.
// The auth routes will not allow a user who is logged in to visit the login/signup pages. If they do, we redirect them to the dashboard.

const Auth = ({ isAuthenticated, path, component: Component }) => (
  <Route
    path={path}
    render={(props) =>
      isAuthenticated ? (
        <Redirect to="/authenticated" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

export const AuthRoute = withRouter(connect(mapStateToProps)(Auth));

const Protected = ({ isAuthenticated, path, component: Component }) => (
  <Route
    path={path}
    render={(props) =>
      isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
    }
  />
);

export const ProtectedRoute = withRouter(connect(mapStateToProps)(Protected));

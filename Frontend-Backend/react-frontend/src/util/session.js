export const checkLoggedIn = async () => {
  const response = await fetch("/api/auth/sessionCheck");
  const { user } = await response.json();
  let preloadedState = {};
  if (user) {
    preloadedState = {
      auth: {
        isAuthenticated: true,
        user,
      },
    };
  }
  // console.log("User: ", user);
  // console.log("preloadedState: ", preloadedState);
  return preloadedState;
};

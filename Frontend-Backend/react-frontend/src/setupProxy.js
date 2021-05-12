// found this from here: https://medium.com/bb-tutorials-and-thoughts/react-how-to-proxy-to-backend-server-5588a9e0347
// I tested this way of proxying, instead of putting "proxy": "http://localhost:3080" in pachage.json file.
// It works in development but still not in the build.

// const createProxyMiddleware = require("http-proxy-middleware");

// module.exports = function (app) {
//   app.use(
//     "/api",
//     createProxyMiddleware({
//       target: "http://localhost:5000/",
//       changeOrigin: true,
//     })
//   );
// };

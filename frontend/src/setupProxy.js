const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/heroku-proxy",
    createProxyMiddleware({
      target: "https://ebaybaymo-api.herokuapp.com",
      changeOrigin: true,
      pathRewrite: { "^/heroku-proxy": "" },
    })
  );

  app.use(
    "/auth-proxy",
    createProxyMiddleware({
      target: "https://ebaybaymo-server-b084d082cda7.herokuapp.com",
      changeOrigin: true,
      pathRewrite: { "^/auth-proxy": "" },
    })
  );
};

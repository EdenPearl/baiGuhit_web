const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/heroku-proxy",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: { "^/heroku-proxy": "" },
    })
  );

  app.use(
    "/auth-proxy",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: { "^/auth-proxy": "" },
    })
  );
};

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/auth", "/game", "/cart", "/drag", "/multiple", "/typing"],
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
    })
  );

  app.use(
    "/heroku-proxy",
    createProxyMiddleware({
      target: "https://ebaybaymo-api.herokuapp.com",
      changeOrigin: true,
      pathRewrite: { "^/heroku-proxy": "" },
    })
  );
};

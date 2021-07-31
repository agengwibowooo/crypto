const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/crypto/scan", {
            target: "https://scanner.tradingview.com",
            changeOrigin: true,
        })
    );
};

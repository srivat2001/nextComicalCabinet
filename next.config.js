const path = require("path");

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias["@scripts"] = "util/js";
    return config;
  },
};

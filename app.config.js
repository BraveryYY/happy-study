const appJson = require("./app.json");

module.exports = () => {
  const expo = { ...appJson.expo };

  if (process.env.EXPO_BASE_URL) {
    expo.experiments = {
      ...(expo.experiments || {}),
      baseUrl: process.env.EXPO_BASE_URL,
    };
  }

  return { expo };
};

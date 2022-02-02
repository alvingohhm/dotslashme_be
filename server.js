import express from "express";
import config from "./config/index.js";

//////////////////////////////////
// initialize
//////////////////////////////////
const app = express();
//////////////////////////////////
// listening
//////////////////////////////////
app.listen(config.port, () => {
  console.log(`
  ⚡  Using Environment = ${config.env}
  🚀  Server is running
  🔉  Listening on port ${config.port}
`);
});

import { DEDICATED_COMPRESSOR_3KB } from "uWebSockets.js";

const options = {
  /* There are more SSL options, cut for brevity */
  key_file_name: "misc/key.pem",
  cert_file_name: "misc/cert.pem",
};

const behavior = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: DEDICATED_COMPRESSOR_3KB,
};

const config = {
  mongoUrl: "mongodb://localhost/test?retryWrites=true&w=majority",
  mongoDbName: "kaspersky-chat",
  port: parseInt(process.env["PORT"] || "8080", 10),
};

const secretKey = "secret-token-user-key";

export default { options, behavior, config, secretKey };

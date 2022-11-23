import {AppOptions, DEDICATED_COMPRESSOR_3KB, WebSocketBehavior} from "uWebSockets.js";

const options: AppOptions = {
  /* There are more SSL options, cut for brevity */
  key_file_name: 'misc/key.pem',
  cert_file_name: 'misc/cert.pem',
  passphrase: '1234'
};

const behavior: WebSocketBehavior = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: DEDICATED_COMPRESSOR_3KB,
};

const config = {
  mongoUrl: "mongodb://localhost:27017/chat",
  mongoDbName: "chat",
  port: parseInt(process.env["PORT"] || "8080", 10),
};

const secretKey = "secret-token-user-key";

export default { options, behavior, config, secretKey };

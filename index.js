require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const router = require("./routers");
const bodyParser = require("body-parser");
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');


Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
  
  // Middleware untuk menggunakan Sentry
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

app.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));

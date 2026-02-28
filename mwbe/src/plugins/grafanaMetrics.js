const path = require("node:path");
const axios = require("axios");
const protobuf = require("protobufjs");
const snappy = require("snappy");
const promClient = require("prom-client");

let writeRequestTypePromise;

function loadWriteRequestType() {
  if (!writeRequestTypePromise) {
    const protoPath = path.resolve(__dirname, "../../remote.proto");
    writeRequestTypePromise = protobuf
      .load(protoPath)
      .then((root) => root.lookupType("prometheus.WriteRequest"));
  }

  return writeRequestTypePromise;
}

function normalizeSamples(metricsJson) {
  const now = Date.now();
  const timeSeries = [];

  metricsJson.forEach((metric) => {
    (metric.values || []).forEach((sample) => {
      const numericValue = Number(sample.value);

      if (!Number.isFinite(numericValue)) {
        return;
      }

      const labels = [{ name: "__name__", value: metric.name }];
      const sampleLabels = sample.labels || {};

      Object.keys(sampleLabels).forEach((key) => {
        labels.push({ name: key, value: String(sampleLabels[key]) });
      });

      const timestamp = Number.isFinite(Number(sample.timestamp))
        ? Math.trunc(Number(sample.timestamp))
        : now;

      timeSeries.push({
        labels,
        samples: [
          {
            value: numericValue,
            timestamp,
          },
        ],
      });
    });
  });

  return timeSeries;
}

function registerGrafanaMetrics(app) {
  app.decorate("pushMetricsToGrafana", async function pushMetricsToGrafana() {
    const username = process.env.GRAFANA_USERNAME;
    const apiKey = process.env.GRAFANA_API_KEY;
    const pushUrl = process.env.GRAFANA_PUSH_URL;

    if (!username || !apiKey || !pushUrl) {
      app.log.warn("Grafana push skipped: missing GRAFANA_USERNAME/API_KEY/PUSH_URL");
      return { pushed: 0, skipped: true };
    }

    const metricsJson = await promClient.register.getMetricsAsJSON();
    const timeseries = normalizeSamples(metricsJson);

    if (timeseries.length === 0) {
      app.log.info("Grafana push skipped: no Prometheus samples available");
      return { pushed: 0, skipped: true };
    }

    const WriteRequest = await loadWriteRequestType();
    const payload = WriteRequest.encode({ timeseries }).finish();
    const compressedPayload = await snappy.compress(payload);
    const auth = Buffer.from(`${username}:${apiKey}`).toString("base64");

    await axios.post(pushUrl, compressedPayload, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-protobuf",
        "Content-Encoding": "snappy",
        "X-Prometheus-Remote-Write-Version": "0.1.0",
      },
      maxBodyLength: Infinity,
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    app.log.info({ samples: timeseries.length }, "Pushed metrics to Grafana Cloud");
    return { pushed: timeseries.length };
  });
}

module.exports = registerGrafanaMetrics;

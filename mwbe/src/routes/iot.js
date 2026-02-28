const promClient = require('prom-client');

const METRIC_TYPES = ['air_quality', 'no2', 'temperature', 'humidity', 'noise_levels'];

const sensorDataMetric = new promClient.Gauge({
  name: 'sensor_data_metric',
  help: 'IoT sensor data by metric type',
  labelNames: ['sensor_id', 'metric_type'],
});

function createRandomValue(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function iotRoutes(app) {
  app.get('/metrics', async (req, reply) => {
    reply.header('Content-Type', promClient.register.contentType);
    return promClient.register.metrics();
  });

  app.post('/data', async (req, reply) => {
    const { sensor_id, value, metric_type } = req.body;
    const metricType = String(metric_type ?? 'temperature').toLowerCase();

    if (!sensor_id || value === undefined) {
      reply.status(400).send({ error: 'Missing sensor_id or value' });
      return;
    }

    if (!METRIC_TYPES.includes(metricType)) {
      reply.status(400).send({
        error: `metric_type must be one of: ${METRIC_TYPES.join(', ')}`,
      });
      return;
    }

    if (!Number.isFinite(Number(value))) {
      reply.status(400).send({ error: 'value must be a finite number' });
      return;
    }

    // Update Prometheus metric
    sensorDataMetric.set({ sensor_id, metric_type: metricType }, Number(value));

    reply.send({ status: 'success' });
  });

  app.post('/dummy', async (req, reply) => {
    const payload = req.body || {};
    const count = Number(payload.count ?? 5);
    const min = Number(payload.min ?? 10);
    const max = Number(payload.max ?? 100);

    if (!Number.isInteger(count) || count < 1 || count > 100) {
      reply.status(400).send({ error: 'count must be an integer between 1 and 100' });
      return;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
      reply.status(400).send({ error: 'min and max must be numbers and min must be less than max' });
      return;
    }

    const samples = [];

    for (let index = 1; index <= count; index += 1) {
      const sensorId = `dummy-sensor-${index}`;
      METRIC_TYPES.forEach((metricType) => {
        const value = createRandomValue(min, max);
        sensorDataMetric.set({ sensor_id: sensorId, metric_type: metricType }, value);
        samples.push({ sensor_id: sensorId, metric_type: metricType, value });
      });
    }

    // Push metrics to Grafana Cloud immediately
    try {
      if (typeof app.pushMetricsToGrafana === 'function') {
        await app.pushMetricsToGrafana();
      }
    } catch (err) {
      console.error('Error pushing metrics:', err.message);
    }

    reply.send({
      status: 'success',
      generated: samples.length,
      samples,
    });
  });
}

module.exports = iotRoutes;
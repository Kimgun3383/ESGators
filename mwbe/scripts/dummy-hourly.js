const BASE_URL = process.env.DUMMY_BASE_URL || "http://localhost:3000";
const ENDPOINT = `${BASE_URL.replace(/\/$/, "")}/iot/dummy`;

const TOTAL_MINUTES = Number(process.env.DUMMY_TOTAL_MINUTES || 60);
const INTERVAL_MS = Number(process.env.DUMMY_INTERVAL_MS || 60_000);
const COUNT = Number(process.env.DUMMY_COUNT || 5);
const MIN = Number(process.env.DUMMY_MIN || 10);
const MAX = Number(process.env.DUMMY_MAX || 100);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pushOnce(iteration) {
  const startedAt = new Date().toISOString();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      count: COUNT,
      min: MIN,
      max: MAX,
    }),
  });

  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `Request ${iteration}/${TOTAL_MINUTES} failed (${response.status}): ${JSON.stringify(body)}`
    );
  }

  const generated = body?.generated ?? "unknown";
  console.log(`[${startedAt}] ${iteration}/${TOTAL_MINUTES} pushed, generated=${generated}`);
}

async function run() {
  console.log(`Start pushing dummy data to ${ENDPOINT}`);
  console.log(
    `Schedule: ${TOTAL_MINUTES} times, every ${INTERVAL_MS / 1000}s | payload: count=${COUNT}, min=${MIN}, max=${MAX}`
  );

  for (let iteration = 1; iteration <= TOTAL_MINUTES; iteration += 1) {
    try {
      await pushOnce(iteration);
    } catch (error) {
      console.error(error.message);
    }

    if (iteration < TOTAL_MINUTES) {
      await delay(INTERVAL_MS);
    }
  }

  console.log("Finished dummy data schedule.");
}

run().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});

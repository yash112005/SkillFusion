async function retryWithBackoff(fn, options = {}) {
  const {
    retries = 3,
    delayMs = 1000,
    factor = 2,
    shouldRetry = (err) => {
      const status = err.status || err.statusCode || err?.response?.status;
      return status === 429 || status === 503;
    }
  } = options;

  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;

      if (attempt >= retries || !shouldRetry(err)) {
        throw err;
      }

      const waitTime = delayMs * Math.pow(factor, attempt - 1);
      console.log(`Retrying in ${waitTime}ms (attempt ${attempt}/${retries})...`);

      await new Promise(res => setTimeout(res, waitTime));
    }
  }
}

module.exports = retryWithBackoff;
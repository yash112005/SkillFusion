async function retryWithBackoff(fn, options = {}) {
  const {
    retries = 3,
    delay = 35,
    factor = 2,
    shouldRetry = (err) => err.status === 429
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

      const waitTime = delay * Math.pow(factor, attempt - 1);
      console.log(`Retrying in ${waitTime}s (attempt ${attempt}/${retries})...`);

      await new Promise(res => setTimeout(res, waitTime * 1000));
    }
  }
}

module.exports = retryWithBackoff;
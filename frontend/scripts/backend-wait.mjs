const waitForBackend = async() => {
  let status = 0;

  while (status != 200) {
    const response = await fetch(process.env.BACKEND_URL);

    try {
      const result = await response.json();
      status = result.status;
    } catch {
      continue
    }

    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}

waitForBackend()
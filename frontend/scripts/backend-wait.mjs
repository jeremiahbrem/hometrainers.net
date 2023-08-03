const waitForBackend = async() => {
  let status = 0;

  while (status != 200) {
  var response = await fetch(process.env.BACKEND_URL);

    try {
      var result = await response.json();
      status = result.status;
    } catch {
      continue
    }
  }
}

waitForBackend()
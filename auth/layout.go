package main

var LayoutStart = `
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
</head>

<body>
  <div class="container p-5 d-flex flex-column justify-content-center" style="height: 100vh; padding-top: 5rem;">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 shadow p-3 mb-5 rounded">
        <div
          style="overflow: hidden; height: 4rem; width: 7rem;"
        >
          <img
            src="/hpt-logo.svg"
            style="height: 100%; width: 100%; transform: translate(-16%,9%) scale(1.5)"
          />
        </div>
        <h1 class="pb-3" style="font-size: 1.1rem;">{{ .heading }}</h1>

`
var LayoutEnd = `
			</div>
		</div>
	</div>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
</body>
`

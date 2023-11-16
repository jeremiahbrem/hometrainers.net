## [HomeTrainers.net](https://hometrainers.net)

A networking app and page builder for personal trainers, built with NextJS, NextAuth, Jest, Go, Cypress, Docker, and deployed with Pulumi, CircleCi, and Google Cloud.

### Frontend (NextJS, NextAuth)
The frontend includes authorization via NextAuth with a Google provider and a custom provider that authorizes with the Oauth2 server in `auth`. Other notable features include a page builder with block components at `/my-page`, a profile provider, and a dynamic url page (`[slug].tsx`) that renders all the active pages fetched from the `backend` api.

### Backend (Go)
The backend includes models for Pages, Profiles, Cities, and Goals, as well as the api to fetch and update the data. Users are validated with authorization when fetching profiles or updating user pages. Page block data is saved as JSON in the Postgres database along with the other page data.

### Auth (Go)
A custom Oauth2 server is found in the `auth` directory which allows users to register and validate with email. This server also provides a secure and stable login process for Cypress end-to-end tests in CircleCi runs.

### Test (Cypress)
End-to-end, real browser testing is setup in the `test` folder, including login, profile, and page creation/editing tests.

### Infrastructure (Go)
The `infrastructure` directory contains all the deployment setup using Pulumi and Google Cloud.
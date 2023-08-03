#!/bin/bash

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${BACKEND_URL})" != "200" ]]; do sleep 5; done

npm run build

npm run start
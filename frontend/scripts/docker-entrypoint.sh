#!/bin/bash

RETRIES=0
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${BACKEND_URL})" != "200" ]]
  || [[ $RETRIES -LT 10 ]]; do sleep 5; ((RETRIES++)); done

npm run build

npm run start
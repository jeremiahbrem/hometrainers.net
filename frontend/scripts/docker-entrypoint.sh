#!/bin/bash

RETRIES=0
STATUS=0

while [[ $STATUS -ne "200" || $RETRIES -LT 10 ]];
  STATUS="$(curl -s -o /dev/null -w ''%{http_code}'' http://backend:8080)";
  do sleep 5;
  ((RETRIES++));
done

npm run build

npm run start
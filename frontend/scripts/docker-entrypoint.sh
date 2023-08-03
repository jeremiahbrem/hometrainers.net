#!/bin/bash

RETRIES=0
STATUS="500"
URL='http://api:8080'

while [[ $STATUS -ne "200" || $RETRIES -lt 15 ]];
  do
    STATUS="$(curl -s -o /dev/null -w ''%{http_code}'' $URL)"
    sleep 5
    RETRIES=$((RETRIES+1))
    echo "retrying api ready check..."
done

npm run build

npm run start
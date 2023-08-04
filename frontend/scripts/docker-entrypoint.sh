#!/bin/bash

retries=0
status="500"
url='http://backend:8080'

while [[ $status -ne "200" && $retries -ne 12 ]];
  do
    status="$(curl -s -o /dev/null -w ''%{http_code}'' $url)"
    sleep 5
    retries=$((retries+1))
    echo "retrying api ready check..."
    echo "$retries"
done

if [[ $status -ne "200" && $retries == 12]];
  then
    echo "api not available"
    echo 11
  else
    npm run build
    npm run start
fi


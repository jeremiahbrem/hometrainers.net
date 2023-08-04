#!/bin/bash

retries=0
status="500"
url='http://api:8080'

while [[ $status -ne "200" && $retries -ne 12 ]];
  do
    status="$(curl -s -o /dev/null -w ''%{http_code}'' $url)"
    sleep 5
    retries=$((retries+1))
    echo "retrying api ready check..."
    echo "$retries"
done

npm run build

npm run start
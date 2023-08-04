#!/bin/bash

retries=0
status="500"
url='http://api:8080'

while [[ $status -ne "200" && $retries -ne 3 ]];
  do
    status="$(curl -s -o /dev/null -w ''%{http_code}'' $url)"
    sleep 1
    retries=$((retries+1))
    echo "retrying api ready check..."
    echo "$retries"
done

npm run build

npm run start
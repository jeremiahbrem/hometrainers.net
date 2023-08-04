#!/bin/bash

attempts=0
status="500"
url='http://localhost:8080'

while [[ $status -ne "200" && $attempts -ne 12 ]];
  do
    attempts=$((attempts+1))
    echo "trying api ready check..."
    echo "attempt: $attempts"

    status="$(curl -s -o /dev/null -w "%{http_code}" $url)"
    echo "$status"

    sleep 5
done

if [[ $status -ne "200" && $attempts -eq 12 ]];
  then
    echo "api not available"
    echo 11
  else
    npm run build
    npm run start
fi


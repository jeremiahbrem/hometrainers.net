#!/bin/bash

while [[ "$(docker container inspect -f '{{.State.Running}}' backend)" != "true" ]]; do sleep 5; done

npm run build

npm run start
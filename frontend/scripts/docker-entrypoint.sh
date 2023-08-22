#!/bin/bash
if [ ${ENVIRONMENT} = "DEV" ]; then
  npm run build && npm run start
else
  npm run start
fi
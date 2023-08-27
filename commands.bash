#!/bin/bash

run-postgres () {
  docker exec -it db psql -U hpt-user hptrainers
}
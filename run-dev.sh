#!/bin/bash

cd backend
go run . & 
cd ../frontend
npm run dev
#!/bin/bash
cd auth
go run . &
cd ../backend
go run . & 
cd ../frontend
npm run dev
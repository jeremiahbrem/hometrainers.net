package main

import "context"

type ClientStoreType interface {
	Context() context.Context
	SessionID() string
	Set(key string, value interface{})
	Delete(key string) interface{}
	Save() error
	Flush() error
}

type ClientStore struct {
}

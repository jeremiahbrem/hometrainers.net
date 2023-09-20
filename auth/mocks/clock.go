package mocks

import (
	"server/services"
	"time"
)

type MockClock struct {
	Time time.Time
}

func (clock *MockClock) GetCurrentTime() time.Time {
	return clock.Time
}

func (clock *MockClock) AddTime(timeArg time.Time, hours int, minutes int, seconds int) time.Time {
	serviceClock := services.Clock{}
	return serviceClock.AddTime(timeArg, hours, minutes, seconds)
}

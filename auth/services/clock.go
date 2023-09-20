package services

import "time"

type ClockType interface {
	GetCurrentTime() time.Time
	AddTime(timeArg time.Time, hours int, minutes int, seconds int) time.Time
}

type Clock struct{}

func (clock *Clock) GetCurrentTime() time.Time {
	return time.Now()
}

func (clock *Clock) AddTime(timeArg time.Time, hours int, minutes int, seconds int) time.Time {
	return timeArg.Add(time.Hour*time.Duration(hours) +
		time.Minute*time.Duration(minutes) +
		time.Second*time.Duration(seconds))
}

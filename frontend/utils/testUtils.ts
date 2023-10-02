import userEvent from "@testing-library/user-event";

export const myUserEvent = userEvent.setup({
  advanceTimers: (x) => jest.advanceTimersByTime(x),
})
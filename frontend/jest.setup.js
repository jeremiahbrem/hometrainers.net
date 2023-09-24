jest.mock('next/navigation', () => ({
  usePathname() {
    return '';
  },
}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return {};
  },
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ }),
  })
)

window.ClipboardEvent = function() {}
window.DragEvent = function() {}
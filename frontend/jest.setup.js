import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  usePathname() {
    return '';
  },
}))

jest.mock('next/router', () => ({
  useRouter() {
    return {
      replace() {}
    };
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

document.elementFromPoint = function() {}
window.ClipboardEvent = function() {}
window.DragEvent = function() {}
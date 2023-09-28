import '@testing-library/jest-dom'

process.env.NEXT_PUBLIC_DOMAIN_URL='http://localhost:3000'
process.env.NEXT_PUBLIC_API_URL='http://localhost:8080'

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
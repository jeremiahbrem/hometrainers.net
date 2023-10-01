import { Account } from 'next-auth';
import { Token, authJwtCallback } from './handleJwt';
import { clientId, clientSecret } from './clientInfo';

const now = new Date(2023, 4, 1)

global.fetch = jest.fn()

describe('token refresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  })

  describe('auth provider', () => {
    describe('when valid', () => {
      it('returns token with account info', async () => {
        const account = {
          access_token: 'test-token',
          refresh_token: 'refresh-token',
          expires_at: now.getTime() + 7200,
          provider: 'auth'
        } as Account
  
        const token = {} as Token
  
        const result = await authJwtCallback(token, account)
  
        expect(result).toEqual({
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          provider: 'auth'
        })

        expect(global.fetch).not.toHaveBeenCalled()
      })
      
      it('returns token without account info', async () => {
        const token = {
          accessToken: 'test-token',
          refreshToken: 'refresh-token',
          accessTokenExpires: now.getTime() + 7200,
          provider: 'auth'
        } as Token
  
        const result = await authJwtCallback(token)
  
        expect(result).toEqual(token)

        expect(global.fetch).not.toHaveBeenCalled()
      })
    })

    describe('when expired', () => {
      const token = {
        accessToken: 'test-token',
        refreshToken: 'old-refresh-token',
        accessTokenExpires: now.getTime() - 10,
        provider: 'auth'
      } as Token

      it('refreshes', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
          json: () => Promise.resolve({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_at: (now.getTime() + 7200) / 1000
          }),
          ok: true
        } as Response))
  
        const result = await authJwtCallback(token)
    
        expect(result).toEqual({
          ...token,
          idToken: '',
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          accessTokenExpires: now.getTime() + (now.getTime() + 7200)
        })

        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_AUTH_SERVER}/oauth/token?` +
          `client_id=${clientId}&` +
          `client_secret=${clientSecret}&` +
          `grant_type=refresh_token&` +
          `refresh_token=old-refresh-token`,
          {
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            "method": "POST"
          }
        )
      })
      
      it('returns token with error', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
          json: () => Promise.resolve({}),
          ok: false
        } as Response))
  
        const result = await authJwtCallback(token)
    
        expect(result).toEqual({
          ...token,
          error: 'RefreshAccessTokenError'
        })
      })
    })
  })
})
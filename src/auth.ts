import { Session } from './session';

export type TwoFactorProvider = 'totp' | 'email' | 'backup';
export type TwoFactorChangeProvider = (provider: TwoFactorProvider) => void;
export type TwoFactorRetry = (code: string) => void;
export interface TwoFactorPayload {
  type: TwoFactorProvider
  login: string
}
export type TwoFactorHandler = (payload: TwoFactorPayload, changeProvider: TwoFactorChangeProvider, retry: TwoFactorRetry) => void;
export interface AuthOptions {
  /**
   * Blasthack Login
   */
  login: string
  /**
   * Blasthack Password
   */
  password: string
  onTwoFactor?: TwoFactorHandler
}

export class AuthError extends Error {
  name = 'AuthError';
}

export class Auth {

  private session = new Session();
  
  constructor(private options: AuthOptions) {}
  
  async auth() {
    await this.session.update();
    const loginBody = this.session.createRequestBody();
    loginBody.append('login', this.options.login);
    loginBody.append('password', this.options.password);
    loginBody.append('remember', '1');
    const loginResponse = await this.session.client.post('/login/login', loginBody.toString());
    if (loginResponse.data?.html?.title === 'Вход') throw new AuthError('Incorrect login or password');
    if (loginResponse.data?.redirect?.includes('two-step')) 
      await this.processTwoFactor(loginResponse.data.redirect);
    return this.session;
  }

  private async processTwoFactor(url: string) {
    const { onTwoFactor } = this.options;
    if (onTwoFactor === undefined) throw new AuthError('Need a TwoFactorHandler for authorize account');
    let twoFactorPassed = false;
    let currentUrl = url;
    while (!twoFactorPassed) {
      const twoFactorResponse = await this.session.client.get(currentUrl);
      const provider: TwoFactorProvider =
          twoFactorResponse.data.includes('введите код подтверждения') ? 'totp' 
            : twoFactorResponse.data.includes('отправлено электронное письмо с одноразовым кодом') ? 'email' 
              : 'backup';
      const [handlerEvent, eventValue] = await new Promise<['try_code', string] | ['change_provider', TwoFactorProvider]>((respond) => {
        onTwoFactor({ type: provider, login: this.options.login }, (p) => respond(['change_provider', p]), (c) => respond(['try_code', c]));
      });

      if (handlerEvent === 'change_provider') {
        const newUrl = new URL(url);
        newUrl.searchParams.set('provider', eventValue);
        currentUrl = newUrl.toString();
        continue;
      }

      if (handlerEvent === 'try_code') {
        const enterBody = this.session.createRequestBody();
        enterBody.append('code', eventValue);
        enterBody.append('trust', '1');
        enterBody.append('confirm', '1');
        enterBody.append('provider', provider);
        enterBody.append('remember', '1');
        const twoFactorEnterResponse = await this.session.client.post('/login/two-step', enterBody.toString());
        twoFactorPassed = twoFactorEnterResponse.data.status === 'ok';
      }
    }
  }
  
}
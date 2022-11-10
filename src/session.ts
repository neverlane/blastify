import { Cookie, CookieJar } from 'tough-cookie';
import axios from 'axios';
import { BLASTHACK_BASE_URL } from './constants';
import { base64 } from './utils';

export class Session {
  private xfToken = '';
  private jar = new CookieJar();
  public client = axios.create({
    baseURL: BLASTHACK_BASE_URL,
    validateStatus: null,
    beforeRedirect: (_options, responseDetails) => this.parseCookies(<string[]> <unknown> responseDetails.headers['set-cookie'])
  });

  /**
   * Returns user cookie
   */
  get userCookie() {
    return this.jar.getCookiesSync(BLASTHACK_BASE_URL).find(cookie => cookie.key === 'xf_user');
  }

  /**
   * Account UserID, returns -1 if not loggined
   */
  get id(): number {
    return +(this.userCookie?.value.match(/\d+/)?.[0] ?? -1);
  }

  constructor() {
    this.client.interceptors.request.use(async (request) => {
      if(!request.headers) request.headers = {};
      request.headers.cookie = await this.jar.getCookieString(BLASTHACK_BASE_URL);
      return request;
    });
    this.client.interceptors.response.use(async (response) => {
      if (typeof response.data === 'string') {
        const xfToken = response.data.match(/name="_xfToken"\s+value="(?<xfToken>\d+,[a-z\d]+)"/i)?.groups?.xfToken;
        if (xfToken) this.xfToken = xfToken;
      }
      if (response.headers['set-cookie']) await this.parseCookies(response.headers['set-cookie']);
      return response;
    });
  }

  /**
   * Update xfToken and other cookies
   */
  async update() {
    await this.client.get('/');
  }

  async save() {
    return base64.encode(JSON.stringify(await this.jar.getCookies(BLASTHACK_BASE_URL)));
  }

  async load(str: string) {
    const cookies = JSON.parse(base64.decode(str));
    for (const {expires, creation, lastAccessed, ...jsonCookie} of cookies) {
      const cookie = new Cookie({
        ...jsonCookie,
        expires: new Date(expires),
        creation: new Date(creation),
        lastAccessed: new Date(lastAccessed),
      });
      await this.jar.setCookie(cookie, BLASTHACK_BASE_URL);
    }
  }

  async parseCookies(cookies: string[]) {
    for (const rawCookie of cookies) {
      const cookie = Cookie.parse(rawCookie);
      if (cookie) await this.jar.setCookie(cookie, BLASTHACK_BASE_URL);
    }
  }

  createRequestBody() {
    const url = new URLSearchParams();
    url.append('_xfToken', this.xfToken);
    url.append('_xfResponseType', 'json');
    url.append('_xfWithData', '1');
    return url;
  }

}
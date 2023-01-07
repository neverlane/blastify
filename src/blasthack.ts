import { createWindow } from './helpers';
import { Session } from './session';

export class BlastHackError extends Error {
  name = 'BlastHackError';
}

export interface BlastHackAlert {
  id: number;
  text: string;
  link: string | null;
  imageUrl: string | null;
  imageLink: string | null;
}

export class BlastHack {
  constructor(public session = new Session()) {}

  get userId() {
    return this.session.id;
  }

  async sendMessageInProfile(profileId: number, message: string) {
    const body = this.session.createRequestBody();
    body.append('message_html', message);
    const response = await this.session.client.post(`/members/${profileId}/post`, body);    
    const {status, redirect: profilePostLink, errors} = response.data;
    if(!status) throw new BlastHackError('Invalid response');
    if(status === 'error') throw new BlastHackError(errors.join(', '));
    return profilePostLink as string;
  }

  async getAlerts(): Promise<BlastHackAlert[]> {
    const list: BlastHackAlert[] = [];
    const response = await this.session.client.get('/account/alerts');
    const window = createWindow(response.data);
    
    for (const el of window.document.querySelectorAll('li[data-alert-id]')) {
      const textElement = el.querySelector('.contentRow-main');
      if (!textElement) continue;
      const userElement = el.querySelector('.contentRow-figure a');
      const splittedRawText = textElement.textContent.trim().split(/\s*\n\s*/);
      const notfText = splittedRawText.slice(0, splittedRawText.length - 1).join('\n');
      
      list.push({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: +el.dataset.alertId,
        text: notfText,
        link: textElement.querySelector('.fauxBlockLink-blockLink')?.getAttribute('href') ?? null,
        imageUrl: userElement?.querySelector('img')?.getAttribute('src') ?? null,
        imageLink: userElement?.getAttribute('href') ?? null,
      });
    }
    return list;
  }
}
import { Session } from './session';

export class BlastHackError extends Error {
  name = 'BlastHackError';
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

}
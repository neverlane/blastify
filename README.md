<p align="center">
  <img src="https://raw.githubusercontent.com/neverlane/blastify/master/.github/blastify.png" alt="...">
</p>

<p align="center"><b>Blastify</b></p>
<p align="center">Modern ES6 Promise based API client for BlastHack</p>

> ## Warning ⚠: Package not ready for use in production mode, check out what's left to do below. As soon as the package is ready, it will be available in NPM

### Todo

- [x] Session
- [x] Auth
- [ ] BlastHack API Methods
- [ ] MessageBuilder

| 📖 [Documentation](https://neverlane.github.io/blastify/index.html) |
| ------------------------------------------------------------------------- |

<p align="center">
 <a href="https://npmjs.com/package/blastify">
   <img src="https://img.shields.io/npm/v/blastify?label=version&logo=npm&color=ligthgreen" alt="Version">
 </a>
 <a href="https://npmjs.com/package/blastify">
   <img src="https://img.shields.io/npm/dt/blastify?&logo=npm" alt="Version">
 <a href="https://wakatime.com/badge/user/4b74d795-1e0e-43cf-b84d-79752949c562/project/1db7997f-4f52-4a4e-ae5d-5853f23da767">
   <img src="https://wakatime.com/badge/user/4b74d795-1e0e-43cf-b84d-79752949c562/project/1db7997f-4f52-4a4e-ae5d-5853f23da767.svg" alt="WakaTime Stats">
 </a>
</p>

## Install 📦

```bash
# using npm
npm i blastify
# using yarn
yarn add blastify
# using pnpm
pnpm add blastify
```

## Usage 🔧

Check all available methods in [📖 Documentation](https://neverlane.github.io/blastify/index.html).

```js
import { BlastHack, Auth } from 'blastify'; // ESM
// OR
const { BlastHack, Auth } = require('blastify'); // CommonJS

// Create BlastHack client, without auth
const blasthack = new BlastHack();

// Find user by nickname
blasthack.findUser('neverlane')
  // Get user profile wall by id
  .then((user) => blasthack.getWall(user.id))
  .then((wall) => console.log(wall.posts))
  .catch((error) => console.log(error));

// With auth
const neverlaneAccount = new Auth({
  login: 'neverlane',
  password: 'someverystrongpassword',
  // if using 2FA Auth
  async onTwoFactor(payload, changeProvider, retry) {
    if (payload.type !== 'totp')
      return changeProvider('totp');
    const code = await magicFunctionThatGenerateCodeByUsername(payload.login);
    retry(code);
  }
});

neverlaneAccount.auth()
  .then(async (session) => {
    const blasthack = new BlastHack(session);
    await blasthack.sendMessageInProfile(blasthack.userId, 'hello from blastify');
  })
  .catch((error) => console.error(error));
```

## Warning ⚠

Since blast.hk (that using XenForo as engine for forum ) does not provide an open API, this library is based on the parsing of HTML site pages.
If the site changes affect the HTML used for parsing, the library may break at any time and not give the expected result.
I will try to update it as soon as possible.
Use at your own risk!

## Thanks 🙏
MrCreepTon for his [Shitty-BlastHack-Client-API](https://github.com/MrCreepTon/Shitty-BlastHack-Client-API)

## Project Stats
![Alt](https://repobeats.axiom.co/api/embed/a89f447003388dbc5e86f6102ed37ab9ec5663e2.svg "Repobeats analytics image")

ok

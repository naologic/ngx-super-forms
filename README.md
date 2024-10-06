# Angular Super Forms

This library adds some much-needed features on top of Angular Forms and Reactive forms, to make it more developer friendly.

![Known Vulnerabilities](https://snyk.io/test/github/naologic/ngx-super-forms/badge.svg)



## :bulb: Features

- :racehorse: get pristine only or dirty only values
- :zap: get typed via `getAsNaoFormArray`, `getAsNaoFormControl`, `getAsNaoFormGroup`
- :hammer: patch at any level `patchDeep()`
- :bug: find nested errors with `getAllErrors()` or get `getAllErrorsFlat()` full paths with errors


## Install

```bash
npm install --save @naologic/forms @naologic/pipes
```

### Publish
Increment the version of both packages based on the packages.json version. Keep them in sync. 
Files to modify
1. packages.json
2. projects/naologic/forms/packages.json
3. projects/naologic/pipes/packages.json

And increment the version. An existing version cannot be deployed to NPM and the package manager will reject it. 
Commit to git.

Publishing is done automatically when you create a new release or you can do it manually:



```bash
npm run publish:forms
```

### License
![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)

## Samples


## Naologic no-code platform
_Naologic offers a completely visual, no code application platform that helps small- and medium-sized businesses build or 
customize their own marketing, sales, operations, HR, training or purchasing applications. All without a single line of code_


_Built with :heart: and :robot: by [Naologic no-code](https://naologic.com/bob-builder)_

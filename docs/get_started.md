# :fireworks: ngx-super-forms 
[![Build Status](https://travis-ci.org/naologic/ngx-super-forms.svg?branch=master)](https://travis-ci.org/naologic/ngx-super-forms)
[![Known Vulnerabilities](https://snyk.io/test/github/naologic/ngx-super-forms/badge.svg?targetFile=package.json)](https://snyk.io/test/github/naologic/ngx-super-forms?targetFile=package.json)

_This is a collection of [naologic](https://naologic.com) public [angular 6](https://angular.io/) libraries. Each one is published as an individual npm package_


## :page_with_curl: Forms

```bash
npm install --save @naologic/forms
```
[![NPM](https://nodei.co/npm/@naologic/forms.png)](https://nodei.co/npm/@naologic/forms/)


## :page_with_curl: Pipes

```bash
npm install --save @naologic/pipes
```
[![NPM](https://nodei.co/npm/@naologic/pipes.png)](https://nodei.co/npm/@naologic/pipes/)


## Publishing a package

Build all packages
```bash
npm run package
```

Navigate to the package you want to publish/update in npm
```$xslt
cd dist/naologic/{package}
```

Login to the npm user
```
npm whoami // << test if you are logged in
npm adduser // << authorize local machine
npm login // << duhh
```

``

Publish the package 
```$xslt
npm run publish:pipes
npm run publish:forms
```

### License 
![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)

_Made with :heart: in San Francisco :us:_ by [naologic](https://naologic.com)

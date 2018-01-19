# PJAX
This is my own condensed pjax (pushstate + ajax) library for super fast load times, has **no dependencies** and no additional server requirements

If you want to see a demo, have a look at my [github pages](https://zeraphie.github.io/) site!

---

## Installation
This is available as a package on npm so you can add this to your project by using npm or yarn

**npm**
```bash
npm install z-pjax --save-dev
```

**yarn**
```bash
yarn add z-pjax --dev
```

## Usage
In your main JavaScript file, import the class, setup the pjax object and then attach any functions that need to go onload with `pjax.onload`, which is a wrapper for `window.onload` and when the pjax request has finished

```javascript
import PJAX from './src/PJAX';

let pjax = new PJAX();

let x = 0;

pjax.onload(() => {
    x++;
    
    console.log(`Loaded ${x} times with pjax`);
});

pjax.setup();
```

## Selecting data to PJAX
This library is able to replace various different elements on a webpage, it currently replaces the main content (body), the title tag, and then any matching attributes that you want.

### Changing the `container` and `links`
The main functionality of PJAX is used in the `container` and `links` properties, and there are two ways of changing what these are (the defaults are `.body` and `.pjax-link`

**Constructor**
```javascript
let pjax = new PJAX('main', 'a');
pjax.setup();
```

**After Initialisation**
```javascript
let pjax = new PJAX();

pjax.container = 'main';
pjax.links = 'a';

pjax.setup();
```

### Changing text content outside of the `container`
Sometimes elements outside of the `container` will need to change as well, such as the title of the page, or the h1 if it exists outside, in order to change what elements have their `textContent` property changed, the following is needed (these are also the defaults)

```javascript
let pjax = new PJAX();

pjax.replace.textContent = [
    'title'
];

pjax.setup();
```

### Changing attributes outside of the `container`
Sometimes attributes of elements will also need to be changed, particularly ones related to SEO or Social media, this library also covers those, but if you need to change the behaviour, you'll need to do the following (these are also the defaults)

```javascript
let pjax = new PJAX();

pjax.replace.attribute = [
    {
        selector: 'meta[name$="title"]',
        attribute: 'content'
    },
    {
        selector: 'meta[name$="description"]',
        attribute: 'content'
    },
    {
        selector: 'meta[property^="og:"]',
        attribute: 'content'
    },
    {
        selector: 'meta[property^="article:"]',
        attribute: 'content'
    },
    {
        selector: 'link[rel="canonical"]',
        attribute: 'href'
    }
];

pjax.setup();
```

---

## Notes
This class uses the `forEach` method for nodelists, so if you need to support IE11 for some reason, add this polyfill in
```javascript
if(typeof NodeList.prototype.forEach === 'undefined'){
    /* Polyfill for nodelist foreach for ie11 */		
    NodeList.prototype.forEach = function (callback, scope){
        for(var i = 0; i < this.length; i++){
            callback.call(scope, this[i], i);
        }
    };
}
```

---

## Building
If for some reason, you want to build the files for this library yourself (instead of using `dist/pjax.js`), you can run the following commands to work locally with it

**Install dependencies for `gulp`**
```bash
npm install babel-cli babel-preset-env babel-core babelify browserify del gulp gulp-plumber gulp-sourcemaps gulp-uglify gulp-util run-sequence vinyl-buffer vinyl-source-stream
```

**Running `gulp`
```bash
gulp # This command builds the files, then watches for any changes in the src directory
gulp build # This command only builds the files
gulp watch # This command only watches the files
```

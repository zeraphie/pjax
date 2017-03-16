# PJAX
This is my own condensed pjax (pushstate + ajax) wrapper for super fast load times, has **no dependencies** and no additional server requirements

If you want to see a demo, have a look at my [github pages](https://lopeax.github.io/) site! Although at the moment this doesn't use the es6 version

---

## Usage
At the start of your js file, setup the pjax class via using the es6 import function

```javascript
import PJAX from "pjax";
let pjax = new PJAX();
```

Then add any javascript that requires to the page to be fully loaded with `pjax.onload`

```javascript
pjax.onload(function(){
    // Do something for when a page has loaded, either initially or via pjax!
});
```

And add this as the last bit of javascript to set everything up

```javascript
pjax.setup();
```

If you want to change the container which pjax replaces, or which links it attaches pjax to, you can do it as below, anytime before the setup, this pjax library uses `document.querySelector` in order to get the very first match for the container, so you can use any class/id/attribute combo you wish

```javascript
// First style, adding them directly to the constructor
let pjax = new PJAX('#pjax-container', 'a[data-pjax]');

// If for some reason you don't want to change them in the constructor
// you can change them as follows
pjax.container = '#pjax-container';
pjax.links = 'a[data-pjax]';

// Then do the setup!
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

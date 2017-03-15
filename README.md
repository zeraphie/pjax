# PJAX
This is my own condensed pjax (pushstate + ajax) wrapper for super fast load times and does not rely on jQuery

## Usage
Simply include the javascript and then you're set to use PJAX! *Remember to put it above pretty much everything!*

In order to actually use it, wrap the code you want to run when a page has finished loaded in the `pjax.onload` wrapper function as follows

```javascript
pjax.onload(function(){
    // Do something for when a page has loaded, either initially or via pjax!
});
```

And add this as the last bit of javascript to set everything up

```javascript
pjax.setup();
```

If you want to change the container which pjax replaces, you can do it as below, anytime before the setup, this pjax library uses `document.querySelector` in order to get the very first match for the container, so you can use any class/id/attribute combo you wish

```javascript
pjax.container = '#pjax-container';
pjax.setup();
```


## Todo

- [ ] Add detailed comments!
- [ ] Rewrite it as an ES6 Class

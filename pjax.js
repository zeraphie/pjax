if (typeof NodeList.prototype.forEach === 'undefined') {
    /* Polyfill for nodelist foreach for ie11 */
    NodeList.prototype.forEach = function (callback, scope) {
        for (var i = 0; i < this.length; i++) {
            callback.call(scope, this[i], i); /* passes back stuff we need */
        }
    };
}

/**
 * This is my own version of pjax, written as a short version of the pjax libraries
 * in order to understand how it works
 */
window.pjax = {};

pjax.container = '.body';
pjax.links = '.pjax-link';
pjax.replace = {
    textContent: [
        'title',
        '.header-title h1'
    ],
    attribute: [
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
    ]
};

pjax.funQueue = {};

pjax.setup = function(){
    var self = this;

    if (history && history.pushState) {
        self.addLinkEvent(document.querySelectorAll(self.links));

        window.onpopstate = function() {
            self.request(window.location.href);
        };
    }

    return this;
};

pjax.addLinkEvent = function(pjaxLinks){
    var self = this;
    
    pjaxLinks.forEach(function(pjaxLink){
        pjaxLink.addEventListener('click', function(e){
            if(e.target.tagName.toLowerCase() === 'a'){
                e.preventDefault();
                self.request(e.target.href);
                history.pushState(null, null, e.target.href);
            }
        });
    });
    
    return this;
};

pjax.request = function(url) {
    var self = this;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.responseType = 'document';
    
    xhr.addEventListener('load', function(e){
        var response = this.response;
                
        for(var i = 0, len = self.replace.textContent.length; i < len; i++){
            var els = document.querySelectorAll(self.replace.textContent[i]);
            els.forEach(function(el, key){
                el.textContent = response.querySelectorAll(self.replace.textContent[i])[key].textContent;
            });
        }

        for(var i = 0, len = self.replace.attribute.length; i < len; i++){
            var els = document.querySelectorAll(self.replace.attribute[i].selector);
            els.forEach(function(el, key){
                el.setAttribute(
                    pjax.replace.attribute[i].attribute,
                    response.querySelectorAll(self.replace.attribute[i].selector)[key].getAttribute(self.replace.attribute[i].attribute)
                );
            });
        }

        var scripts = response.querySelectorAll(self.container + ' script');
        self.addLinkEvent(response.querySelectorAll(self.container + ' ' + self.links));
        
        var newPage = response.querySelector(self.container);
        
        var currentPage = document.querySelector(self.container);
        currentPage.parentNode.replaceChild(newPage, currentPage);

        scripts.forEach(function(code){
            var script = document.createElement('script');
            script.text = code.textContent;
            document.head.appendChild(script).parentNode.removeChild(script);
        });
        
        if(typeof self.afterLoad === 'function'){
            self.afterLoad();
        }
    });

    xhr.send();

    return this;
};

pjax.execQueue = function(){
    var queue = pjax.funQueue;
    
    for(var funcName in queue){
        if(queue.hasOwnProperty(funcName)){
            if(typeof queue[funcName] === 'function'){
                try {
                    queue[funcName]();
                } catch(e) {
                    console.log(e);
                }
            }
        }
    }
    
    return this;
};

pjax.onload = function(callback, func){
    if(typeof callback === 'function'){
        pjax.funQueue[Object.keys(pjax.funQueue).length.toString()] = callback;
    }

    if((typeof callback === 'number' || typeof callback === 'string') && typeof func === 'function'){
        pjax.funQueue[callback] = func;
    }
    
    window.onload = this.execQueue;
    this.afterLoad = this.execQueue;
    
    return this;
};

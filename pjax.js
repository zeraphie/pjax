if (typeof NodeList.prototype.forEach === 'undefined') {
    /* Polyfill for nodelist foreach for ie11 */
    NodeList.prototype.forEach = function (callback, scope) {
        for (var i = 0; i < this.length; i++) {
            callback.call(scope, this[i], i); /* passes back stuff we need */
        }
    };
}

window.pjax = {};

pjax.container = '.body';
pjax.funQueue = {};

pjax.setup = function(){
    var self = this;

    if (history && history.pushState) {
        var pjaxLinks = document.querySelectorAll('.pjax-link');
        pjaxLinks.forEach(function(pjaxLink){
            pjaxLink.addEventListener('click', function(e){
                if(e.target.tagName.toLowerCase() === 'a'){
                    e.preventDefault();
                    self.request(e.target.href);
                    history.pushState(null, null, e.target.href);
                }
            });
        });

        window.onpopstate = function() {
            self.request(window.location.href);
        };
    }

    return this;
};

pjax.request = function(url) {
    var self = this;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.responseType = 'document';
    
    xhr.addEventListener('load', function(e){
        document.querySelector('title').textContent = this.response.querySelector('title').textContent;
        document.querySelector('meta[name="description"]').setAttribute(
            'content',
            this.response.querySelector('meta[name="description"]').getAttribute('content')
        );

        var scripts = this.response.querySelectorAll(self.container + ' script');
        
        var newPage = this.response.querySelector(self.container);
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

if(typeof NodeList.prototype.forEach === 'undefined'){
    /* Polyfill for nodelist foreach for ie11 */		
    NodeList.prototype.forEach = function (callback, scope){
        for(var i = 0; i < this.length; i++){
            callback.call(scope, this[i], i);
        }
    };
}

/**
 * This is an ES6 Class that handles PJAX logic for an application
 *
 * It utilizes pushstate and history in order to help make a site load only a
 * portion of the page, thereby lowering the amount of requests on the page and
 * as a result speeds up user experience for a live demo, view
 * https://lopeax.github.io/
 *
 * @license MIT
 * @version 1.0.0
 * @author Tony Lopez
 */
class PJAX {
    /**
     * Construct the PJAX class and add the default container if none is passed
     * through as well as an empty function queue
     *
     * @param string container The selector for the pjax to replace
     */
    constructor(
        container = this.constructor.DEFAULT_CONTAINER,
        links = this.constructor.DEFAULT_LINKS
    ){
        this.container = container;
        this.links = links;
        this.queue = {};
    }

    /**
     * The default selector for PJAX to replace
     *
     * @return string DEFAULT_CONTAINER The default container
     */
    static get DEFAULT_CONTAINER(){
        return '.body';
    }

    /**
     * The default selector for PJAX to execute pjax from
     *
     * @return string DEFAULT_CONTAINER The default links
     */
    static get DEFAULT_LINKS(){
        return '.pjax-link';
    }

    /**
     * Getter for the container
     *
     * @return string The container for pjax to replace
     */
    get container(){
        return this._container;
    }

    /**
     * Setter for the container
     *
     * @param string container The container for pjax to replace
     */
    set container(container){
        this._container = container;
    }

    /**
     * Getter for the links
     *
     * @return string The selector for PJAX to execute pjax from
     */
    get links(){
        return this._links;
    }

    /**
     * Setter for the links
     *
     * @param string links The selector for PJAX to execute pjax from
     */
    set links(links){
        this._links = links;
    }

    /**
     * Getter for the function queue
     *
     * @return object The function queue
     */
    get queue(){
        return this._queue;
    }

    /**
     * Setter for the function queue
     *
     * @param object queue The function queue
     */
    set queue(queue){
        this._queue = queue;
    }

    /**
     * Add all the event listeners needed for an application to use pjax, these
     * are typically just links and forms, although forms are to come
     *
     * @return PJAX
     */
    setup(){
        let self = this;

        /* Do nothing if the browser doesn't support history or pushstate */
        if (history && history.pushState) {
            /* Intercept all .pjax-link links and execute pjax instead */
            let pjaxLinks = document.querySelectorAll(self.links);
            pjaxLinks.forEach(function(pjaxLink) {
                pjaxLink.addEventListener('click', function(e) {
                    if (e.target.tagName.toLowerCase() === 'a') {
                        e.preventDefault();
                        self.request(e.target.href);
                        history.pushState(null, null, e.target.href);
                    }
                });
            });

            /* Make sure that navigating back fires a new pjax request */
            window.onpopstate = function() {
                self.request(window.location.href);
            };
        }

        return this;
    }
    
    /**
     * Make the actual pjax request, replacing the title and description of the
     * page as well as the body and making scripts executable
     *
     * @param string url The url to perform the pjax request to
     *
     * @return PJAX
     */
    request(url){
        let self = this;

        /* Open an ajax get request to the url, requesting the document */
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'document';

        /* After loading the document, do the replacing */
        xhr.addEventListener('load', function(e){
            /* Replace the title and dscription */
            document.querySelector('title').textContent = this.response.querySelector('title').textContent;
            if(
                document.querySelector('meta[name="description"]')
                    &&
                this.response.querySelector('meta[name="description"]')
            ){
                document.querySelector('meta[name="description"]').setAttribute(
                    'content',
                    this.response.querySelector('meta[name="description"]').getAttribute('content')
                );
            }

            /* Get all the script tags (if any) that are inside the container */
            let scripts = this.response.querySelectorAll(self.container + ' script');

            /* Replace the current page's container with the new container */
            let newPage = this.response.querySelector(self.container);
            let currentPage = document.querySelector(self.container);
            currentPage.parentNode.replaceChild(newPage, currentPage);

            /* Execute the scripts that are loaded with the new container once only */
            scripts.forEach(function(code){
                let script = document.createElement('script');
                script.text = code.textContent;
                document.head.appendChild(script).parentNode.removeChild(script);
            });

            /* Execute the queue */
            if(typeof self.afterLoad === 'function'){
                self.afterLoad();
            }
        });

        /* Actually send the ajax request */
        xhr.send();

        return this;
    }
    
    /**
     * Execute the function queue
     *
     * @return PJAX
     */
    execQueue(){
        for(let funcName in this.queue){
            if(this.queue.hasOwnProperty(funcName)){
                if(typeof this.queue[funcName] === 'function'){
                    try {
                        this.queue[funcName]();
                    } catch(e) {
                        console.log(e);
                    }
                }
            }
        }

        return this;
    }
    
    /**
     * This function is to be used in place of window.onload as it will fire any
     * javascript when the page is loaded initially and on any subsequent pjax
     * requests
     *
     * @param function|string|number callback The callback function, or the key
     *                                        for the callback
     * @param function               func     The callback function if a key is
     *                                        included
     *
     * @return PJAX
     */
    onload(callback, func){
        if(typeof callback === 'function'){
            this.queue[
                Object.keys(this.queue).length.toString()
            ] = callback;
        }

        if(
            (typeof callback === 'number' || typeof callback === 'string')
                &&
            typeof func === 'function'
        ){
            this.queue[callback] = func;
        }

        window.onload = this.execQueue;
        this.afterLoad = this.execQueue;

        return this;
    }
}

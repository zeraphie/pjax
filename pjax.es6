/**
 * This is an ES6 Class that handles PJAX logic for an application
 *
 * It utilizes pushstate and history in order to help make a site load only a
 * portion of the page, thereby lowering the amount of requests on the page and
 * as a result speeds up user experience for a live demo, view
 * https://zeraphie.github.io/
 *
 * @license MIT
 * @version 1.1.0
 * @author Izzy Skye
 */
export default class PJAX {
    /**
     * Construct the PJAX class and add the default container if none is passed
     * through as well as an empty function queue
     *
     * @param string container The selector for the pjax to replace
     */
    constructor(
        container = this.constructor.DEFAULT_CONTAINER,
        links = this.constructor.DEFAULT_LINKS,
        replace = this.constructor.DEFAULT_REPLACE
    ){
        this.container = container;
        this.links = links;
        this.replace = replace;
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
     * The default elements to replace the content/attribute
     *
     * @return string DEFAULT_REPLACE The default replace
     */
    static get DEFAULT_REPLACE(){
        return {
            textContent: [
                'title',
                'h1'
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
        }
    }

    /**
     * Add all the event listeners needed for an application to use pjax, these
     * are typically just links and forms, although forms are to come
     *
     * @return PJAX
     */
    setup(){
        if (history && history.pushState) {
            this.addLinkEvent(document.querySelectorAll(this.links));

            window.onpopstate = () => {
                this.request(window.location.href);
            };

            // Make sure the onload functions are fired at least once!
            this.execQueue();
        }

        return this;
    }

    /**
     * Add the pjax link event to all the links passed into this function
     *
     * @param NodeList pjaxLinks A node list of all the links to pjax
     *
     * @return PJAX
     */
    addLinkEvent(pjaxLinks){
        pjaxLinks.forEach(pjaxLink => {
            pjaxLink.addEventListener('click', e => {
                e.preventDefault();
                this.request(e.target.href);
                history.pushState(null, null, e.target.href);
            });
        });

        return this;
    };
    
    /**
     * Make the actual pjax request, replacing the title and description of the
     * page as well as the body and making scripts executable
     *
     * @param string url The url to perform the pjax request to
     *
     * @return PJAX
     */
    request(url){
        /* Open an ajax get request to the url, requesting the document */
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'document';

        /* After loading the document, do the replacing */
        xhr.addEventListener('load', e => {
            let response = e.currentTarget.response;

            /* Replace all the text content fields */
            for(let i = 0, len = this.replace.textContent.length; i < len; i++){
                let elements = document.querySelectorAll(
                    this.replace.textContent[i]
                );
                
                elements.forEach((element, key) => {
                    let found = response.querySelectorAll(
                        this.replace.textContent[i]
                    );

                    if(found.length && found[key]){
                        element.textContent = found[key].textContent;
                    }
                });
            }

            /* Replace all the attributes */
            for(let i = 0, len = this.replace.attribute.length; i < len; i++){
                let elements = document.querySelectorAll(
                    this.replace.attribute[i].selector
                );
                
                elements.forEach((element, key) => {
                    let found = response.querySelectorAll(
                        this.replace.attribute[i].selector
                    );

                    if(found.length && found[key]){
                        element.setAttribute(
                            this.replace.attribute[i].attribute,
                            found[key].getAttribute(
                                this.replace.attribute[i].attribute
                            )
                        );
                    }
                });
            }

            /* Add the pjax link event to any new links in the content */
            this.addLinkEvent(response.querySelectorAll(
                this.container + ' ' + this.links
            ));

            /* Replace the actual content of the page */
            let newPage = response.querySelector(this.container);

            let currentPage = document.querySelector(this.container);
            currentPage.parentNode.replaceChild(newPage, currentPage);

            /* Replace all the script tags and execute them */
            let scripts = response.querySelectorAll(
                this.container + ' script'
            );

            scripts.forEach(code => {
                let script = document.createElement('script');
                script.text = code.textContent;
                document.head.appendChild(script).parentNode.removeChild(script);
            });

            /* Execute the queue */
            if(typeof this.afterLoad === 'function'){
                this.afterLoad();
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
                        console.log('Failed to execute: ', e);
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

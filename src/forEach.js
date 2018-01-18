if(typeof NodeList.prototype.forEach === 'undefined'){
    /* Polyfill for nodelist foreach for ie11 */
    NodeList.prototype.forEach = function(callback, scope){
        for(let i = 0; i < this.length; i++){
            callback.call(scope, this[i], i);
        }
    };
}

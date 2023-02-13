util = {
   
    tryTo: function(description, callback){
        for(let timeout=1000; timeout>0; timeout--){
            if(callback()){
                return;
            }
        }
        throw 'Timeout while trying to '+description;
    },

    randomRange: function(min, max) {
        return Math.floor(Math.random()*(max-min+1))+min;
    }
}
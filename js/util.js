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
    },

    // Fisher-Yates shuffle 
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    shuffle: function(arr){
        let temp, r;
        for (let i = 1; i< arr.length; i++){
            r = util.randomRange(0,i);
            temp = arr[i];
            arr[i] = arr[r];
            arr[r] = temp;
        }
        return arr;
    },

    rightPad: function(textArray){
        let finalText = "";
        textArray.forEach(text => {
            text += "";
            for(let i = text.length; i < 10; i++){
                text += " ";
            }
            finalText += text;
        });
        return finalText;
    },
}
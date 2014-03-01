(function($window){

    var sanitizeCallback = function(callback){
            return (typeof callback === 'function') ? callback : function(){};
        },

        //The methods on this object are meta-functions for producing model behaviors
        modelBuilder = {

            save: function(){
                return function(){};
            },

            create: function(){
                return function(){};
            },

            update: function(){
                return function(){};
            },

            delete: function(){
                return function(){};
            }

        };

    var Modella = {

        modelConfig: {},

        //This handles the primary initialization
        init: function(callback){
            var config = this.modelConfig,
                passedCallback = sanitizeCallback(callback),

                localCallback = function(dataObject, error){
                    passedCallback(dataObject, error);
                };

            if(typeof this.modelConfig.initialObject !== 'undefined'){
                this.initByObject(this.modelConfig.initialModel, localCallback);
            } else if(typeof this.modelConfig.initialId !== 'undefined'){
                this.initById(this.modelConfig.initialId, localCallback);
            }else {
                localCallback();
            }
        },

        /*
        * The functions below are not intended to be called independently.
        * Calling these functions by themselves could produce an incomplete model,
        * which will interfere with the intended behavior of the resulting
        * model.
        */

        //This preps a bare data object for model calls
        initByObject: function(modelObject, callback){
            var passedCallback = sanitizeCallback(callback),

                localCallback = function(model){
                    passedCallback(model);
                };

            this.initModel(modelObject, localCallback);
        },

        //This requests a data object from the service provided in the config
        initById: function(id, callback){
            var $this = this,
                passedCallback = sanitizeCallback(callback),

                localCallback = function(dataObject, error){
                    if(dataObject !== null){
                        $this.initByObject(dataObject, passedCallback);
                    } else {
                        passedCallback(null, error);
                    }
                };

            this.modelConfig.service.get(id, localCallback);
        },

        //This takes in a finalized data object and applies model functions to it
        initModel: function(modelObject, callback){
            var passedCallback = sanitizeCallback(callback);

            for(key in modelBuilder){
                if(modelBuilder.hasOwnProperty(key)){
                    modelObject[key] = modelBuilder[key]();
                }
            }

            passedCallback(modelObject);
        }

    }

    $window.modella = Modella;

})(window);
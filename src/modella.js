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
        init: function(modelDefinition, callback){
            var config = this.modelConfig,
                passedCallback = sanitizeCallback(callback),

                localCallback = function(model){
                    passedCallback(model);

                    config = {};
                };

            localCallback();
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
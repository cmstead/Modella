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

    var Modella = function(){};

    Modella.prototype = {

        modelConfig: {},

        //Copy constructor
        create: function(){
            return Object.create(this);
        },

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
            } else if(typeof this.modelConfig.initialParentId !== 'undefined') {
                this.initByParentId(this.modelConfig.initialParentId, localCallback);
            } else if(typeof this.modelConfig.initialIds !== 'undefined') {
                this.initByIds(this.modelConfig.initialIds, localCallback);
            } else {
                passedCallback(null, Error("Unable to initialize model."));
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

        //This requests a dataset from the service based on a set of record ids
        initByIds: function(idSet, callback){
            var $this = this,
                index = -1,
                finalModelSet = [],
                passedCallback = sanitizeCallback(callback),

                pushModel = function(model){
                    finalModelSet.push(model);
                },

                localCallback = function(model, error){

                    if(model !== null){
                        $this.initByObject(model, pushModel);
                    } else if(finalModelSet !== null) {
                        finalModelSet = null;
                        passedCallback(null, error);
                    }

                    if(finalModelSet !== null && finalModelSet.length === idSet.length){
                        passedCallback(finalModelSet);
                    }

                };

            while(typeof idSet[++index] !== 'undefined'){
                this.modelConfig.service.get(idSet[index], localCallback);
            }
        },

        //This requests a dataset from the service by parentId in the config
        initByParentId: function(parentId, callback){
            var $this = this,
                finalModelSet = [],
                passedCallback = sanitizeCallback(callback),
                pushModel = function(model){
                    finalModelSet.push(model);
                },

                prepareModelSet = function(dataSet){
                    var index = -1;

                    while(typeof dataSet[++index] !== 'undefined'){
                        $this.initByObject(dataSet[index], pushModel);
                    }
                },

                localCallback = function(modelSet, error){
                    if(modelSet !== null){
                        prepareModelSet(modelSet)
                        passedCallback(finalModelSet);
                    } else {
                        passedCallback(null, error);
                    }
                };

            this.modelConfig.service.getByParentId(parentId, localCallback);
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

    };

    $window.modella = Modella;

})(window);
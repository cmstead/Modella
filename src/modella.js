(function($window){
    'use strict';

    var sanitizeCallback = function(callback){
            return (typeof callback === 'function') ? callback : function(){};
        },

        sanitizeInterceptor = function(interceptor){
            return (typeof interceptor !== 'undefined') ? interceptor : function(model){
                return model;
            };
        },

        cleanModel = function(model){
            var modelStr,
                sanitizedModel = {};

            for(var key in model){
                if(model.hasOwnProperty(key) && typeof model[key] !== 'function'){
                    sanitizedModel[key] = model[key];
                }
            }

            //Stringify the model to strip prototype info and functions
            modelStr = JSON.stringify(sanitizedModel);

            return JSON.parse(modelStr);
        },

        //The methods on this object are meta-functions for producing model behaviors
        modelBuilder = {

            copy: function(){
                return function(model){
                    return cleanModel(model);
                };
            },

            saveRecord: function(){
                return function(callback){
                    var passedCallback = sanitizeCallback(callback);

                    if(!this.id){
                        this.createRecord(passedCallback);
                    } else {
                        this.updateRecord(passedCallback);
                    }
                };
            },

            createRecord: function(modelConfig){
                var postBehavior = modelConfig.service.post,
                    interceptor = sanitizeInterceptor(modelConfig.beforeCreate);

                return function(callback){
                    var $this = this,
                        passedCallback = sanitizeCallback(callback),
                        $model = this.copy(this),

                        localCallback = function(id, error){
                            if(id !== null){
                                $this.id = id;
                                passedCallback($model);
                            } else {
                                passedCallback(null, error);
                            }
                        };

                    $model = interceptor($model);

                    postBehavior($model, localCallback);
                };
            },

            updateRecord: function(modelConfig){
                var putBehavior = modelConfig.service.put,
                    interceptor = sanitizeInterceptor(modelConfig.beforeUpdate);

                return function(callback){
                    var $model = this.copy(this),
                        sanitizedCallback = sanitizeCallback(callback),

                        localCallback = function(data, error){
                            if(data !== null){
                                sanitizedCallback($model);
                            } else {
                                sanitizedCallback(null, error);
                            }
                        };

                    $model = interceptor($model);

                    putBehavior($model, localCallback);
                };
            },

            deleteRecord: function(modelConfig){
                var deleteBehavior = modelConfig.service.del,
                    interceptor = sanitizeInterceptor(modelConfig.beforeDelete);

                return function(callback){
                    var $model = this.copy(this),
                        passedCallback = sanitizeCallback(callback),

                        localCallback = function(data, error){
                            if(data !== null){
                                passedCallback($model);
                            } else {
                                passedCallback(null, error);
                            }
                        };

                    $model = interceptor($model);

                    deleteBehavior($model, localCallback);
                };
            },

            revise: function(){
                return function(updateObj){
                    for(var key in this){
                        if(this.hasOwnProperty(key) && typeof this[key] !== 'function'){
                            this[key] = (typeof updateObj[key] !== 'undefined') ? updateObj[key] : this[key];
                        }
                    }
                };
            }

        },

        Modella = function(){};

    Modella.prototype = {

        modelConfig: {},

        //Copy constructor
        createInstance: function(config){
            var sanitizedConfig = (typeof config !== 'undefined') ? config : {},
                $modellaObject = Object.create(this);

            $modellaObject.modelConfig = sanitizedConfig;
            return $modellaObject;
        },

        //This handles the primary initialization
        init: function(callback){
            var localCallback = sanitizeCallback(callback);

            if(typeof this.modelConfig.initialObject !== 'undefined'){
                this.initByObject(this.modelConfig.initialObject, localCallback);
            } else if(typeof this.modelConfig.initialId !== 'undefined'){
                this.initById(this.modelConfig.initialId, localCallback);
            } else if(typeof this.modelConfig.initialParentId !== 'undefined') {
                this.initByParentId(this.modelConfig.initialParentId, localCallback);
            } else if(typeof this.modelConfig.initialQuery !== 'undefined') {
                this.initByQuery(this.modelConfig.initialQuery, localCallback);
            } else if(typeof this.modelConfig.initialIds !== 'undefined') {
                this.initByIds(this.modelConfig.initialIds, localCallback);
            } else {
                localCallback(null, Error("Unable to initialize model."));
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
                afterInit = sanitizeInterceptor(this.modelConfig.afterInit);

            function localCallback(model){
                model = afterInit(model);
                passedCallback(model);
            }

            this.initModel(modelObject, localCallback);
        },

        //This requests a data object from the service provided in the config
        initById: function(id, callback){
            var $this = this,
                passedCallback = sanitizeCallback(callback),
                afterGet = sanitizeInterceptor(this.modelConfig.afterGet),

                localCallback = function(dataObject, error){
                    if(dataObject !== null){
                        dataObject = afterGet(dataObject);
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
                afterGet = sanitizeInterceptor(this.modelConfig.afterGet),

                pushModel = function(model){
                    finalModelSet.push(model);
                },

                localCallback = function(model, error){

                    if(model !== null){
                        model = afterGet(model);
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
                afterGet = sanitizeInterceptor(this.modelConfig.afterGet),

                prepareModelSet = function(dataSet){
                    var index = -1;

                    while(typeof dataSet[++index] !== 'undefined'){
                        dataSet[index] = afterGet(dataSet[index]);
                        $this.initByObject(dataSet[index], pushModel);
                    }
                },

                localCallback = function(modelSet, error){
                    if(modelSet !== null){
                        prepareModelSet(modelSet);
                        passedCallback(finalModelSet);
                    } else {
                        passedCallback(null, error);
                    }
                };

            this.modelConfig.service.getByParentId(parentId, localCallback);
        },

        //This takes in a finalized data object and applies model functions to it
        initModel: function(modelObject, callback){
            var passedCallback = sanitizeCallback(callback),
                key;

            this.modelConfig.customFunctions = (this.modelConfig.customFunctions) ? this.modelConfig.customFunctions : {};

            for(key in modelBuilder){
                if(modelBuilder.hasOwnProperty(key)){
                    modelObject[key] = modelBuilder[key](this.modelConfig);
                }
            }

            for(key in this.modelConfig.customFunctions){
                if(typeof this.modelConfig.customFunctions[key] === 'function'){
                    modelObject[key] = this.modelConfig.customFunctions[key];
                }
            }

            passedCallback(modelObject);
        },

        //This requests a dataset from the service based on a query initial condition
        initByQuery: function(queryString, callback){
            var $this = this,
                finalModelSet = [],
                passedCallback = sanitizeCallback(callback),
                pushModel = function(model){
                    finalModelSet.push(model);
                },
                afterGet = sanitizeInterceptor(this.modelConfig.afterGet),

                prepareModelSet = function(dataSet){
                    var index = -1;

                    while(typeof dataSet[++index] !== 'undefined'){
                        dataSet[index] = afterGet(dataSet[index]);
                        $this.initByObject(dataSet[index], pushModel);
                    }
                },

                localCallback = function(modelSet, error){
                    if(modelSet !== null){
                        prepareModelSet(modelSet);
                        passedCallback(finalModelSet);
                    } else {
                        passedCallback(null, error);
                    }
                };


            this.modelConfig.service.query(queryString, localCallback);
        }

    };

    $window.modella = Modella;

    $window.modella.utilities = {
        sanitizeCallback: sanitizeCallback,
        sanitizeInterceptor: sanitizeInterceptor,
        cleanModel: cleanModel
    };

})(window);
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
                }
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
                                passedCallback(model);
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
                                sanitizedCallback(model);
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
                                passedCallback(model);
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

                localCallback = function(model){
                    passedCallback(model);
                };

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

            this.modelConfig.customFunctions = (this.modelConfig.customFunctions) ? this.modelConfig.customFunctions : {};

            for(var key in modelBuilder){
                if(modelBuilder.hasOwnProperty(key)){
                    modelObject[key] = modelBuilder[key](this.modelConfig);
                }
            }

            for(var key in this.modelConfig.customFunctions){
                if(typeof this.modelConfig.customFunctions[key] === 'function'){
                    modelObject[key] = this.modelConfig.customFunctions[key];
                }
            }

            passedCallback(modelObject);
        }

    };

    $window.modella = Modella;

    $window.modella.utilities = {
        sanitizeCallback: sanitizeCallback,
        sanitizeInterceptor: sanitizeInterceptor,
        cleanModel: cleanModel
    };

})(window);

(function($window){
    'use strict';

    //Pre-hoist variables to be used for model initialization and extension
    var modellaExtender,
        extensionProperties = ["parents", "children"],
        extendedFunctions = {},
        sanitizeCallback = modella.utilities.sanitizeCallback;

    /*
     * Revise-related functions
     */

    //Compile an object with parent/child name values as keys for testing
    function getRelativesList(model){
        var key,
            relativesList = {};

        model.parents = (model.parents) ? model.parents : [];
        model.children = (model.children) ? model.children : [];

        for(var index in model.parents){
            key = model.parents[index].name;
            relativesList[key] = 'parent';
        }

        for(var index in model.children){
            key = model.children[index].name;
            relativesList[key] = 'child';
        }

        return relativesList;
    }

    //Locate record matching id in set of records
    function findMatchingRecord(id, recordSet){
        var matchingRecord = null;

        for(var index in recordSet){
            if(recordSet[index].id && recordSet[index].id === id){
                matchingRecord = recordSet[index];
                break;
            }
        }

        return matchingRecord;
    }

    //Update a set of models with a set of updated values
    function updateRelativeSet(modelArray, updateArray){
        var matchingRecord = null;

        //This is not the most efficient way to go about this.
        for(var index in modelArray){

            if(!modelArray[index].id){
                continue;
            }

            matchingRecord = findMatchingRecord(modelArray[index].id, updateArray);

            if(matchingRecord !== null){
                modelArray[index].revise(matchingRecord);
            }
        }
    }

    //Handle parent/child update behavior
    function updateRelative(modelObj, updateObj){
        if(Object.prototype.toString.call(modelObj) === '[object Array]'){
            updateRelativeSet(modelObj, updateObj);
        } else {
            modelObj.revise(updateObj);
        }
    }

    /*
     *
     * Model relative initialization logic
     *
     * The following functions set initial conditions for initializing parent and child entities
     * to attach to the current model. This includes preparing a callback for properly
     * inserting the new entities into the model and intelligently setting initial conditions
     * based upon the type of relative requested.
     *
     */

    //Curries a function to handle appending data to the existing object
    function buildDataAppenderCallback(object, key, passedCallback){
        var localCallback = sanitizeCallback(passedCallback);

        function callback(data, error){
            if(data !== null){
                object[key] = data;
            }

            localCallback(object[key], error);
        }

        return callback;
    }

    function getBaseConfig($model, objectType, name){
        var configLocation = (objectType === 'parent') ? "parents" : "children",
            key,
            baseConfig;

        for(key in $model[configLocation]){
            if(name === $model[configLocation][key].name){
                baseConfig = $model[configLocation][key].baseConfig;
            }
        }

        return baseConfig;
    }

    //Sets initial condition for requesting a parent or child model
    function setInitialCondition(config, record, $model){
        if(typeof record.foreignKey !== 'undefined'){
            config.initialId = $model[record.foreignKey];
        } else {
            config.initialParentId = $model.id;
        }
    }

    //Checks need for initialization
    function checkRelativeNeedsInitialization(relativeObject){
        var needsInitialization = typeof relativeObject === 'object';

        return (Object.prototype.toString.call(relativeObject) === '[object Array]' && !relativeObject.length) ?
            false : needsInitialization;
    }

    //Generic function for requesting either children or parents of current model
    function getRelatives(dataConfigArray, $modelObj, passedCallback){
        var modelExtender = modella.extender,
            tempConfig,
            tempCallback,
            tempRecord;

        passedCallback = sanitizeCallback(passedCallback);

        for(var index in dataConfigArray){

            tempRecord = dataConfigArray[index];
            tempCallback = buildDataAppenderCallback($modelObj, tempRecord.name, passedCallback);
            tempConfig = tempRecord.baseConfig;

            setInitialCondition(tempConfig, tempRecord, $modelObj);

            modelExtender.init(tempConfig, tempCallback);

        }
    }

    function initializeObject(config, object, callback){
        config.initialObject = object;
        modella.extender.init(config, callback);
    }

    //Handles immediate relative record initialization on existing objects
    function initRelative($relativeObject, baseConfig){
        var callback = function(finalObject){
                $relativeObject = finalObject;
            },
            key;

        if(typeof $relativeObject[0] !== 'undefined'){
            for(key in $relativeObject){
                callback = buildDataAppenderCallback($relativeObject, key);
                initializeObject(baseConfig, $relativeObject[key], callback)
            }
        } else {
            initializeObject(baseConfig, $relativeObject, callback);
        }

        delete baseConfig.initialObject;
    }

    function initRelativeObjects($model){
        var relativesList = getRelativesList($model),
            key,
            needsInitialization,
            baseConfig;

        for(key in relativesList){
            needsInitialization = checkRelativeNeedsInitialization($model[key]);

            if(needsInitialization){
                baseConfig = getBaseConfig($model, relativesList[key], key);
                initRelative($model[key], baseConfig);
            }
        }
    }

    /*
     * Extended copy functionality to ensure proper copy and save behavior of data
     */

    function createSafeModel(model){
        var safeModel = {};

        for(var key in model){
            if(model.hasOwnProperty(key)){
                safeModel[key] = model[key];
            }
        }
    }

    //Remove relatives from model
    function cleanRelatives(model, relativeType){
        var safeModel = createSafeModel(model);

        for(var key in model[relativeType]){
            delete safeModel[key];
        }

        return safeModel;
    }

    //Extends model copy behavior
    function extendCopy(model){
        var originalCopy = model.copy;

        function newCopy($model){
            var amendedModel;

            amendedModel = cleanRelatives($model, 'parents');
            amendedModel = cleanRelatives(amendedModel, 'children');

            delete amendedModel.parents;
            delete amendedModel.children;

            originalCopy(amendedModel);
        }

        model.copy = newCopy;

        return model;
    }

    /*
     * Defining extended functionality to append to the initialized model
     */

    //Function for extending core model to handle getting parents
    extendedFunctions.getParents = function(passedCallback){
        getRelatives(this.parents, this, passedCallback);
    };

    //Function for extending core model to handle getting children
    extendedFunctions.getChildren = function(passedCallback){
        getRelatives(this.children, this, passedCallback);
    };

    //An update to the revise function to update values based on passed object
    extendedFunctions.revise = function(updateObj){
        var relativesList = getRelativesList(this);

        for(var key in updateObj){
            if(!relativesList[key] && this.hasOwnProperty(key)){
                this[key] = updateObj[key];
            } else if(relativesList[key] && this.hasOwnProperty(key)){
                updateRelative(this[key], updateObj[key]);
            }
        }
    }

    /*
     * Functions to extend the base model
     */

    //Extends core model with new and rewritten functions to ensure extended functionality is available
    function appendExtendedFunctions($model){
        for(var key in extendedFunctions){
            if(extendedFunctions.hasOwnProperty(key)){
                $model[key] = extendedFunctions[key];
            }
        }

        return $model;
    }

    //Extends core model with new properties to handle parent/child relationships
    function appendExtendedProperties($config, $model){
        var key,
            tempValue;

        for(var index in extensionProperties){
            key = extensionProperties[index];
            tempValue = (typeof $config[key] !== 'undefined') ? $config[key] : null;
            $model[key] = tempValue;
        }

        return $model;
    }

    //Extends core model with all new and rewritten functions and properties
    function extendModel($config, $model){

        $model = appendExtendedProperties($config, $model);
        $model = appendExtendedFunctions($model);
        $model = extendCopy($model);

        return $model;
    }

    /*
     * Modella extender definition
     */

    //Object to handle initializing and extending a modella core object
    modellaExtender = {

        init: function(config, callback){
            var localModella = new modella(),
                sanitizedCallback = sanitizeCallback(callback),

                localCallback = function($passedModel, $error){
                    var finalModel = $passedModel;
                    if(finalModel && typeof finalModel[0] === 'undefined'){
                        finalModel = extendModel(config, finalModel);
                        initRelativeObjects(finalModel);
                    } else if(finalModel){
                        for(var index in finalModel){
                            finalModel[index] = extendModel(config, finalModel[index]);
                            initRelativeObjects(finalModel);
                        }
                    }

                    sanitizedCallback(finalModel, $error);
                };

            localModella.modelConfig = config;

            localModella.init(localCallback);
        }

    };

    $window.modella.extender = modellaExtender;
})(window);
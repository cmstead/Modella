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

                        localCallback = function(data, error){
                            if(data){
                                passedCallback(data);
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
                                sanitizedCallback(data);
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

/*global modella*/

(function($window){
    'use strict';

    var sanitizeCallback = modella.utilities.sanitizeCallback;

    /*
     * Appends a set of data to the original dataset passed in
     * @param (object) originalSet - original dataset to append to
     * @param (object) newSet - dataset to append to originalSet
     * @returns (object) extended originalSet
     */
    function appendSet(originalSet, newSet){
        newSet = (newSet) ? newSet : [];

        for(var key in newSet){
            originalSet[key] = newSet[key];
        }

        return originalSet;
    }

    /*
     * Builds a data appender function to pass as a callback
     * @param (object) dataObject - data object to append data to
     * @param (string) key - object key for data appending
     * @param (function) callback - callback to execute after appending data
     * @returns (function) dataAppender
     */
    function buildDataAppender(dataObject, key, callback){
        var sanitizedCallback = sanitizeCallback(callback);

        return function(data, error){
            if(data !== null){
                dataObject[key] = data;
            }

            sanitizedCallback(data, error);
        };
    }

    /*
     * Compiles a list of relative objectnames and relative type as specified
     * Not exposed to the world as this is an abstraction for reused code in getRelativesList
     * @param (object) relativeSet - dataset of parent/child data
     * @param (string) relativeType - type of relative data
     * @returns (object) relative set if relatives exist, empty object if none exist
     */
    function compileRelativeList(relativeSet, relativeType){
        var relativeList = {};

        relativeSet = (relativeSet) ? relativeSet : [];

        for(var key in relativeSet){
            var relativeName = relativeSet[key].name;
            relativeList[relativeName] = relativeType;
        }

        return relativeList;
    }

    /*
     * Locates record in dataset with matching id if record exists
     * @param (object) dataSet - set of records to search
     * @param (string) id - id to locate
     * @returns (object) record with matching id if found, null if not
     */
    function findRecordById(dataSet, id){
        var record = null;

        dataSet = (dataSet) ? dataSet : [];

        for(var key in dataSet){
            if(dataSet[key].id && dataSet[key].id === id){
                record = dataSet[key];
                break;
            }
        }

        return record;
    }

    /*
     * Compiles a list of names of parents and children in model
     * @param (object) model - data model to build list from
     * @returns (object) key/value set of names and types of relatives
     */
    function getRelativesList(model){
        var relativesList = {},
            parentList = compileRelativeList(model.parents, 'parent'),
            childList = compileRelativeList(model.children, 'child');

        relativesList = appendSet(relativesList, parentList);
        relativesList = appendSet(relativesList, childList);

        return relativesList;
    }

    /*
     * It verifies object exists and, if it's an array, that it contains elements
     * @param (object) dataObject
     * @returns (boolean) needsInitialization
     */
    function verifyObjectIsValid(dataObject){
        var isValid = (dataObject) ? true : false;

        if(Object.prototype.toString.call(dataObject) === '[object Array]' && !dataObject.length){
            isValid = false;
        }

        return isValid;
    }

    /*
     * Builds a new object wrapper around pointers to passed object
     * @param (object) dataObject - object to create pointers into
     * @returns (object) safeDataObject - an object from which pointers can be removed
     */
    function buildSafeObject(dataObject){
        var safeObject = {};

        dataObject = (dataObject) ? dataObject : {};

        for(var key in dataObject){
            if(dataObject.hasOwnProperty(key)){
                safeObject[key] = dataObject[key];
            }
        }

        return safeObject;
    }

    $window.modella.extension = {
        appendSet: appendSet,
        buildDataAppender: buildDataAppender,
        buildSafeObject: buildSafeObject,
        findRecordById: findRecordById,
        getRelativesList: getRelativesList,
        verifyObjectIsValid: verifyObjectIsValid
    };

})(window);

/*global modella*/

(function($window){
    'use strict';

    //Pre-hoist variables to be used for model initialization and extension
    var modellaExtender,
        extensionProperties = ["parents", "children"],
        extendedFunctions = {},

        buildDataAppender = modella.extension.buildDataAppender,
        buildSafeObject = modella.extension.buildSafeObject,
        checkRelativeNeedsInitialization = modella.extension.verifyObjectIsValid,
        findRecordById = modella.extension.findRecordById,
        getRelativesList = modella.extension.getRelativesList,
        sanitizeCallback = modella.utilities.sanitizeCallback;

    /*
     * Revise-related functions
     */

    /*
     * Update a set of models with a set of updated values
     * @param (array) modelArray - an array of initialized data models
     * @param (array) updateArray - an array of data to update the data model
     */
    function updateRelativeSet(modelArray, updateArray){
        modelArray = (modelArray) ? modelArray : [];

        for(var index in modelArray){
            var matchingRecord = (modelArray[index].id) ? findRecordById(updateArray, modelArray[index].id) : null;

            if(matchingRecord !== null){
                modelArray[index].revise(matchingRecord);
            }
        }
    }

    //Handle parent/child update behavior
    function updateRelative(modelObj, updateObj){
        if(Object.prototype.toString.call(modelObj) === '[object Array]'){
            updateRelativeSet(modelObj, updateObj);
        } else if(modelObj) {
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

    //Generic function for requesting either children or parents of current model
    function getRelatives(dataConfigArray, $modelObj, passedCallback){
        var modelExtender = modella.extender,
            tempConfig,
            tempCallback,
            tempRecord;

        passedCallback = sanitizeCallback(passedCallback);

        for(var index in dataConfigArray){

            tempRecord = dataConfigArray[index];
            tempCallback = buildDataAppender($modelObj, tempRecord.name, passedCallback);
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
                callback = buildDataAppender($relativeObject, key);
                initializeObject(baseConfig, $relativeObject[key], callback);
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

    //Remove relatives from model
    function cleanRelatives(model, relativeType){
        var safeModel = buildSafeObject(model);

        for(var key in model[relativeType]){
            var relativeKey = model[relativeType][key].name;
            delete safeModel[relativeKey];
        }

        return safeModel;
    }

    //Extends model copy behavior
    function extendCopy(model){
        var originalCopy = model.copy;

        model.copy = function ($model){
            var amendedModel;

            $model = ($model) ? $model : this;

            amendedModel = cleanRelatives($model, 'parents');
            amendedModel = cleanRelatives(amendedModel, 'children');

            delete amendedModel.parents;
            delete amendedModel.children;
            delete amendedModel.baseConfig;

            return originalCopy(amendedModel);
        };

        return model;
    }

    //Rcopies (see rcopy) model data in array if array exists
    function rcopyModelArray(modelArray){
        var finalArray = (modelArray) ? [] : undefined,
            returnedCopy;

        if(modelArray){
            for(var key in modelArray){
                returnedCopy = modelArray[key].rcopy();
                finalArray.push(returnedCopy);
            }
        }

        return finalArray;
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
    };

    extendedFunctions.rcopy = function(){
        var $modelCopy = this.copy(),
            returnedCopy,
            childKey;

        if(this.children){
            for(var key in this.children){
                childKey = this.children[key].name;
                returnedCopy = rcopyModelArray(this[childKey]);
                $modelCopy[childKey] = returnedCopy;
            }
        }

        return $modelCopy;
    };

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
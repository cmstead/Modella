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
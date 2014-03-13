(function($window){
    'use strict';

    //Pre-hoist variables to be used for model initialization and extension
    var modellaExtender,
        extensionProperties = ["parents", "children"],
        extendedFunctions = {},
        sanitizeCallback = modella.utilities.sanitizeCallback;

    /*
    *
    * Model cleaning logic
    *
    * In order to ensure the model cleaning is non-destructive to the rich object model,
    * all clean functionality operates on a copy of the model.  The side effect of this
    * is that all clean operations are inherently a copy operation.
    *
    */

    //Cycles through all items in a configured array and copies it, scrubbing model properties.
    function cleanModelSet(modelSet){
        var finalArray = [],
            recordCopy;

        for(var index in modelSet){
            recordCopy = modelSet[index].copy();
            finalArray.push(recordCopy);
        }

        return finalArray;
    }

    //Cleans all extended properties from sanitized model
    function cleanProperties(sanitizedModel){
        var key;

        for(var index in extensionProperties){
            key = extensionProperties[index];
            delete sanitizedModel[key];
        }

        return sanitizedModel;
    }

    //Cleans relatives from a passed set
    function cleanRelatives(sanitizedModel, model, relativeSet){
        var key;

        for(var index in relativeSet){
            key = relativeSet[index].name;

            if(model[key] && Object.prototype.toString.call(model[key]) === '[object Array]'){
                sanitizedModel[key] = cleanModelSet(model[key]);
            } else if (model[key]){
                sanitizedModel[key] = model[key].copy();
            }
        }

        return sanitizedModel;
    }

    //Strips non-core model objects from current model
    function stripRelatives(sanitizedModel, relativeSet){
        var key;

        for(var index in relativeSet){
            key = relativeSet[index].name;
            delete sanitizedModel[key];
        }

        return sanitizedModel;
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

            localCallback(data, error);
        }

        return callback;
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
            tempCallback = buildDataAppenderCallback($modelObj, tempRecord.name, passedCallback);
            tempConfig = tempRecord.baseConfig;

            setInitialCondition(tempConfig, tempRecord, $modelObj);

            modelExtender.init(tempConfig, tempCallback);

        }
    }

    /*
    * Revise-related functions
    */

    //Compile an object with parent/child name values as keys for testing
    function getRelativesList(model){
        var key,
            relativesList = {};

        for(var index in model.parents){
            key = model.parents[index].name;
            relativesList[key] = true;
        }

        for(var index in model.children){
            key = model.children[index].name;
            relativesList[key] = true;
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

    //An update to the copy function to remove all core and extended model properties
    extendedFunctions.copy = function(){
        var sanitizedModel = modella.utilities.cleanModel(this);

        sanitizedModel = cleanProperties(sanitizedModel);
        sanitizedModel = cleanRelatives(sanitizedModel, this, this.children);
        sanitizedModel = cleanRelatives(sanitizedModel, this, this.parents);

        return sanitizedModel;
    };

    //A function for copying a simple version of the model without relatives
    extendedFunctions.simpleCopy = function(){
        var sanitizedModel = modella.utilities.cleanModel(this);

        sanitizedModel = cleanProperties(sanitizedModel);
        sanitizedModel = stripRelatives(sanitizedModel, this.children);
        sanitizedModel = stripRelatives(sanitizedModel, this.parents);

        return sanitizedModel;
    }

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
                    } else if(finalModel){
                        for(var index in finalModel){
                            finalModel[index] = extendModel(config, finalModel[index]);
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
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

    //Cycles through all items in a configured child array and copies it, scrubbing model properties.
    function cleanChildArray(childArray){
        var finalArray = [],
            childCopy;

        for(var index in childArray){
            childCopy = childArray[index].copy();
            finalArray.push(childCopy);
        }

        return finalArray;
    }

    //Cycles through all configured children sets and cleans/copies all elements in the array.
    function cleanChildren(sanitizedModel, model){
        var key;

        for(var index in model.children){

            key = model.children[index].name;

            if(model[key] && model[key].length){
                sanitizedModel[key] = cleanChildArray(model[key]);
            }

        }

        return sanitizedModel;
    }

    //Cleans and copies all parent objects
    function cleanParents(sanitizedModel, model){
        var key;

        for(var index in model.parents){

            key = model.parents[index].name;

            if(model[key]){
                sanitizedModel[key] = model[key].copy();
            }

        }

        return sanitizedModel;
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

    //Copies and returns a scrubbed model tree
    function cleanModel(model){
        var sanitizedModel = modella.utilities.cleanModel(model);

        sanitizedModel = cleanProperties(sanitizedModel);
        sanitizedModel = cleanChildren(sanitizedModel, model);
        sanitizedModel = cleanParents(sanitizedModel, model);

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
    function buildCallback(object, key, passedCallback){
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
            tempCallback = buildCallback($modelObj, tempRecord.name, passedCallback);
            tempConfig = tempRecord.baseConfig;

            setInitialCondition(tempConfig, tempRecord, $modelObj);

            modelExtender.init(tempConfig, tempCallback);

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
        return cleanModel(this);
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
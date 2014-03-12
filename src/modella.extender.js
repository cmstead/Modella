(function($window){
    'use strict';

    var extensionProperties = ["parents", "children"],
        modellaExtender,
        extendedFunctions = {};

    function sanitizeCallback(callback){
        return (typeof callback === 'function') ? callback : function(){};
    }

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

    function cleanChildArray(childArray){
        var finalArray = [],
            childCopy;

        for(var index in childArray){
            childCopy = childArray[index].copy();
            finalArray.push(childCopy);
        }

        return finalArray;
    }

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

    function cleanModel(model){
        var propertyKey,
            sanitizedModel = JSON.parse(JSON.stringify(model));

        for(var index in extensionProperties){
            propertyKey = extensionProperties[index];
            delete sanitizedModel[propertyKey];
        }

        if(model.children){
            sanitizedModel = cleanChildren(sanitizedModel, model);
        }

        if(model.parents){
            sanitizedModel = cleanParents(sanitizedModel, model);
        }

        return sanitizedModel;
    }

    function setInitialCondition(config, record, $model){
        if(typeof record.foreignKey !== 'undefined'){
            config.initialId = $model[record.foreignKey];
        } else {
            config.initialParentId = $model.id;
        }
    }

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

    extendedFunctions.getParents = function(passedCallback){
        getRelatives(this.parents, this, passedCallback);
    };

    extendedFunctions.getChildren = function(passedCallback){
        getRelatives(this.children, this, passedCallback);
    };

    extendedFunctions.copy = function(){
        return cleanModel(this);
    };

    function appendExtendedFunctions($model){
        for(var key in extendedFunctions){
            if(extendedFunctions.hasOwnProperty(key)){
                $model[key] = extendedFunctions[key];
            }
        }

        return $model;
    }

    function extendModel($config, $model){
        var key,
            tempValue;

        for(var index in extensionProperties){
            key = extensionProperties[index];
            tempValue = (typeof $config[key] !== 'undefined') ? $config[key] : null;
            $model[key] = tempValue;
        }

        $model = appendExtendedFunctions($model);

        return $model;
    }

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
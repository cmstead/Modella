(function($window){

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

    extendedFunctions.getParents = function(passedCallback){
        var index = -1,
            modelExtender = modella.extender,
            tempConfig,
            tempCallback,
            parentRecord;

        while(typeof this.parents[++index] !== 'undefined'){
            parentRecord = this.parents[index];

            tempCallback = buildCallback(this, parentRecord.name, passedCallback);

            tempConfig = parentRecord.baseConfig;
            tempConfig.initialId = this[parentRecord.foreignKey];

            modelExtender.init(tempConfig, tempCallback);
        }
    };

    extendedFunctions.getChildren = function(passedCallback){
        var index = -1,
            modelExtender = modella.extender,
            tempConfig,
            tempCallback,
            childRecord;

        while(typeof this.children[++index] !== 'undefined'){
            childRecord = this.children[index];

            tempCallback = buildCallback(this, childRecord.name, passedCallback);

            tempConfig = childRecord.baseConfig;
            tempConfig.initialParentId = this.id;

            modelExtender.init(tempConfig, tempCallback);
        }
    };

    function appendExtendedFunctions($model){
        for(key in extendedFunctions){
            if(extendedFunctions.hasOwnProperty(key)){
                $model[key] = extendedFunctions[key];
            }
        }

        return $model;
    }

    function extendModel($config, $model){
        var index = -1,
            key,
            tempValue;

        while(typeof extensionProperties[++index] !== 'undefined'){
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
                    if(finalModel){
                        finalModel = extendModel(config, finalModel);
                    }

                    sanitizedCallback(finalModel, $error);
                };

            localModella.modelConfig = config;

            localModella.init(localCallback);
        }

    };

    $window.modella.extender = modellaExtender;
})(window);
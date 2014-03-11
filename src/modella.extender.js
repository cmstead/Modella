(function($window){

    var extensionProperties = ["parents", "children"],
        modellaExtender;

    function extendModel($config, $model){
        var index = -1,
            key,
            tempValue;

        while(typeof extensionProperties[++index] !== 'undefined'){
            key = extensionProperties[index];
            tempValue = (typeof $config[key] !== 'undefined') ? $config[key] : null;
            $model[key] = tempValue;
        }

        return $model;
    }

    modellaExtender = {

        init: function(config, callback){
            var localModella = new modella(),

                localCallback = function($passedModel, $error){
                    var finalModel = $passedModel;

                    if(finalModel){
                        finalModel = extendModel(config, finalModel);
                    }

                    callback(finalModel, $error);
                };

            localModella.modelConfig = config;

            localModella.init(localCallback);
        }

    };

    $window.modella.extender = modellaExtender;
})(window);
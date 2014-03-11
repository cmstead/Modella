(function($window){

    var extensionProperties = ["parents", "children"],
        modellaAbstractor;

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

    function captureExtensionData(){}

    modellaAbstractor = {

        init: function(config, callback){
            var localModella = new modella(),

                localCallback = function($passedModel){
                    var finalModel = extendModel(config, $passedModel);

                    callback(finalModel);
                };

            localModella.modelConfig = config;

            localModella.init(localCallback);
        }

    };

    $window.modella.abstractor = modellaAbstractor;
})(window);
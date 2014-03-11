describe("Modella extended object", function(){

    var $model,
        $modelConfig;

    beforeEach(function(){
        var $modellaWrapper = modella.extender,

            $mockService = {
                delete: jasmine.createSpy("service.delete"),
                get: jasmine.createSpy("service.get"),
                getByParentId: jasmine.createSpy("service.getByParentId"),
                post: jasmine.createSpy("service.post"),
                put: jasmine.createSpy("service.put")
            },

            $initialObject = {
                id: '1234',
                parent_id: '1234a'
            };

        $modelConfig = {
            parents: [{
                name: "parent",
                foreignKey: "parent_id",
                baseConfig: {
                    service: Object.create($mockService)
                }
            }],
            children: [{
                name: "child",
                baseConfig: {
                    service: Object.create($mockService)
                }
            }],
            service: $mockService,
            initialObject: $initialObject
        };

        function callback(returnedModel, $error){
            $model = returnedModel;
        };

        $modellaWrapper.init($modelConfig, callback);
    });

    describe("getParents", function(){

        it("should be a function", function(){
            expect(typeof $model.getParents).toBe('function');
        });

        it("should call the parent configured service", function(){
            $model.getParents();

            expect($modelConfig.parents[0].baseConfig.service.get).toHaveBeenCalled();
        });

        it("should return an model with core model functions", function(){
            var functionsExist = true;

            $modelConfig.parents[0].baseConfig.service.get = function(obj, callback){
                callback({});
            };

            $model.getParents();

            functionsExist = (typeof $model.parent.createRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.updateRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.deleteRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.copy !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.revise !== "function") ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

    });

    describe("getChildren", function(){

        it("should be a function", function(){
            expect(typeof $model.getChildren).toBe('function');
        });

        it("should call the child configured service", function(){
            $model.getChildren();

            expect($modelConfig.children[0].baseConfig.service.getByParentId).toHaveBeenCalled();
        });

        it("should return an model with core model functions", function(){
            var functionsExist = true;

            $modelConfig.children[0].baseConfig.service.getByParentId = function(obj, callback){
                callback([{}]);
            };

            $model.getChildren();

            functionsExist = (typeof $model.child[0].createRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].updateRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].deleteRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].copy !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].revise !== "function") ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

    });
});
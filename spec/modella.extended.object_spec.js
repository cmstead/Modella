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

    describe("copy", function(){

        it("should return a clean copy of the model", function(){
            var returnedValue = $model.copy(),
                expectedValue = JSON.parse(JSON.stringify($model));

            delete expectedValue.parents;
            delete expectedValue.children;

            expect(JSON.stringify(returnedValue)).toBe(JSON.stringify(expectedValue));
        });

        it("should clean any child objects on the model", function(){
            var returnedValue,
                expectedValue;

            $model.children[0].baseConfig.service.getByParentId = function(obj, callback){
                callback([{}]);
            };

            $model.getChildren();

            returnedValue = $model.copy();
            expectedValue = JSON.parse(JSON.stringify($model));

            delete expectedValue.parents;
            delete expectedValue.children;
            delete expectedValue.child[0].parents;
            delete expectedValue.child[0].children;

            expect(JSON.stringify(returnedValue)).toBe(JSON.stringify(expectedValue));
        });

        it("should clean any parent objects on the model", function(){
            var returnedValue,
                expectedValue;

            $model.parents[0].baseConfig.service.get = function(obj, callback){
                callback({});
            };

            $model.getParents();

            returnedValue = $model.copy();
            expectedValue = JSON.parse(JSON.stringify($model));

            delete expectedValue.parents;
            delete expectedValue.children;
            delete expectedValue.parent.parents;
            delete expectedValue.parent.children;

            expect(JSON.stringify(returnedValue)).toBe(JSON.stringify(expectedValue));
        });

    });

    describe("simpleCopy", function(){

        it("should be a function", function(){
            expect(typeof $model.simpleCopy).toBe('function');
        });

        it("should clean a model with no relatives", function(){
            var returnedModel = $model.simpleCopy(),
                expectedModel = JSON.parse(JSON.stringify($model));

            delete expectedModel.parents;
            delete expectedModel.children;

            expect(JSON.stringify(returnedModel)).toBe(JSON.stringify(expectedModel));
        });

        it("should clean children from copied model", function(){
            var returnedModel,
                expectedModel;

            $model.children[0].baseConfig.service.getByParentId = function(obj, callback){
                callback([{}]);
            };

            $model.getChildren();

            returnedModel = $model.simpleCopy();
            expectedModel = JSON.parse(JSON.stringify($model));

            delete expectedModel.parents;
            delete expectedModel.children;
            delete expectedModel.child;

            expect(JSON.stringify(returnedModel)).toBe(JSON.stringify(expectedModel));
        });

        it("should clean parents from copied model", function(){
            var returnedModel,
                expectedModel;

            $model.parents[0].baseConfig.service.get = function(obj, callback){
                callback([{}]);
            };

            $model.getParents();

            returnedModel = $model.simpleCopy();
            expectedModel = JSON.parse(JSON.stringify($model));

            delete expectedModel.parents;
            delete expectedModel.children;
            delete expectedModel.parent;

            expect(JSON.stringify(returnedModel)).toBe(JSON.stringify(expectedModel));
        });

    });
});
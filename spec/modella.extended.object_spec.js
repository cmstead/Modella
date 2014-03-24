describe("Modella extended object", function(){

    var $model,
        $modelConfig;

    beforeEach(function(){
        var $modellaWrapper = modella.extender,

            $mockService = {
                del: jasmine.createSpy("service.delete"),
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
            functionsExist = (typeof $model.child[0].revise !== "function") ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

    });

    describe("revise", function(){

        it("should update the base model", function(){
            var expectedModel = JSON.parse(JSON.stringify($model));

            expectedModel.id = "5678";
            $model.revise(expectedModel);

            expect(JSON.stringify($model)).toBe(JSON.stringify(expectedModel));
        });

        it("should update the child objects", function(){
            var expectedModel;

            $model.children[0].baseConfig.service.getByParentId = function(obj, callback){
                callback([{id: "56781", test: "test"}]);
            };

            $model.getChildren();

            expectedModel = JSON.parse(JSON.stringify($model));
            expectedModel.child[0].test = "This is a test.";

            $model.revise(expectedModel);

            expect(JSON.stringify($model)).toBe(JSON.stringify(expectedModel));
        });

        it("should not remove model functions from child objects", function(){
            var modelCopy,
                functionsExist = true;

            $model.children[0].baseConfig.service.getByParentId = function(obj, callback){
                callback([{id: "56781", test: "test"}]);
            };

            $model.getChildren();

            modelCopy = JSON.parse(JSON.stringify($model));
            modelCopy.child[0].test = "This is a test.";

            $model.revise(modelCopy);

            functionsExist = (typeof $model.child[0].saveRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.child[0].updateRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.child[0].deleteRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.child[0].revise !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.child[0].getParents !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.child[0].getChildren !== 'function') ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

        it("should update the parent objects", function(){
            var expectedModel;

            $model.parents[0].baseConfig.service.get = function(obj, callback){
                callback({id: "56781", test: "test"});
            };

            $model.getParents();

            expectedModel = JSON.parse(JSON.stringify($model));
            expectedModel.parent.test = "This is a test.";

            $model.revise(expectedModel);

            expect(JSON.stringify($model)).toBe(JSON.stringify(expectedModel));
        });

        it("should not remove model functions from parent objects", function(){
            var modelCopy,
                functionsExist = true;

            $model.parents[0].baseConfig.service.get = function(obj, callback){
                callback({id: "56781", test: "test"});
            };

            $model.getParents();

            modelCopy = JSON.parse(JSON.stringify($model));
            modelCopy.parent.test = "This is a test.";

            $model.revise(modelCopy);

            functionsExist = (typeof $model.parent.saveRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.parent.updateRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.parent.deleteRecord !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.parent.revise !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.parent.getParents !== 'function') ? false : functionsExist;
            functionsExist = (typeof $model.parent.getChildren !== 'function') ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });
    });

});
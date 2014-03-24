describe("Modella.extender", function(){

    var $modellaWrapper,
        $mockService,
        $initialObject;

    beforeEach(function(){
        $modellaWrapper = modella.extender;
        $mockService = {
            del: jasmine.createSpy("service.delete"),
            get: jasmine.createSpy("service.get"),
            post: jasmine.createSpy("service.post"),
            put: jasmine.createSpy("service.put")
        };
        $initialObject = {
            id: '1234',
            parent_id: '1234a'
        };
    });

    it("should be an object", function(){
        expect(typeof $modellaWrapper).toBe("object");
    });

    describe("init", function(){

        it("should be a function", function(){
            expect(typeof $modellaWrapper.init).toBe("function");
        });

        it("should create a modella object", function(){
            var $returnedObject,
                callback = function(createdObj){
                    $returnedObject = createdObj;
                },
                config = {
                    service: $mockService,
                    initialObject: $initialObject
                };

            $modellaWrapper.init(config, callback);

            expect(typeof $returnedObject).toBe("object");
        });

        it("should initialize all child objects", function(){
            var functionsExist = true,
                $model,
                callback = function(createdObj){
                    $model = createdObj;
                },
                config = {
                    service: $mockService,
                    children: [{
                        name: "child",
                        baseConfig: {
                            service: Object.create($mockService)
                        }
                    }]
                };

            config.initialObject = $initialObject;
            config.initialObject.child = [{
                id: '5678',
                parentId: '1234'
            }];

            $modellaWrapper.init(config, callback);

            functionsExist = (typeof $model.child[0].createRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].updateRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].deleteRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.child[0].revise !== "function") ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

        it("should initialize all parent objects", function(){
            var functionsExist = true,
                $model,
                callback = function(createdObj){
                    $model = createdObj;
                },
                config = {
                    service: $mockService,
                    parents: [{
                        name: "parent",
                        foreignKey: "parent_id",
                        baseConfig: {
                            service: Object.create($mockService)
                        }
                    }]
                };

            config.initialObject = $initialObject;
            config.initialObject.parent = {
                id: '5678',
                parentId: '1234'
            };

            $modellaWrapper.init(config, callback);

            functionsExist = (typeof $model.parent.createRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.updateRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.deleteRecord !== "function") ? false : functionsExist;
            functionsExist = (typeof $model.parent.revise !== "function") ? false : functionsExist;

            expect(functionsExist).toBe(true);
        });

    });

    describe("model extension", function(){

        var $returnedModel,
            $parentService,
            $childService;

        beforeEach(function(){

            $parentService = Object.create($mockService);
            $childService = Object.create($mockService);

            var modelConfig = {
                    parents: [{
                        name: "parent",
                        foreignKey: "parent_id",
                        baseConfig: {
                            service: $parentService,
                            initialObject: {}
                        }
                    }],
                    children: [{
                        name: "child",
                        baseConfig: {
                            service: $childService,
                            initialObject: {}
                        }
                    }],
                    service: $mockService,
                    initialObject: $initialObject
                },
                callback = function(passedObject){
                    $returnedModel = passedObject;
                };

            $modellaWrapper.init(modelConfig, callback);

        });

        describe("parents", function(){
            it("should be an array on the returned model", function(){
                expect(typeof $returnedModel.parents).toBe("object");
            });

            it("should match passed array", function(){
                expect(JSON.stringify($returnedModel.parents)).toBe(JSON.stringify([{
                    name: "parent",
                    foreignKey: "parent_id",
                    baseConfig: {
                        service: $parentService,
                        initialObject: {}
                    }
                }]));
            });
        });

        describe("children", function(){
            it("should be an array on the returned model", function(){
                expect(typeof $returnedModel.children).toBe("object");
            });

            it("should match passed array", function(){
                expect(JSON.stringify($returnedModel.children)).toBe(JSON.stringify([{
                    name: "child",
                    baseConfig: {
                        service: $childService,
                        initialObject: {}
                    }
                }]));
            });
        });

    });

});
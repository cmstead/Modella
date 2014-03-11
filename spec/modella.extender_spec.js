describe("Modella.extender", function(){

    var $modellaWrapper,
        $mockService,
        $initialObject;

    beforeEach(function(){
        $modellaWrapper = modella.extender;
        $mockService = {
            delete: jasmine.createSpy("service.delete"),
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
                        baseConfig: {}
                    }],
                    children: [{
                        name: "child",
                        baseConfig: {}
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
                    baseConfig: {}
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
                    baseConfig: {}
                }]));
            });
        });

    });

});
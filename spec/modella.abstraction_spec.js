describe("Modella abstraction layer", function(){

    var $modellaWrapper,
        $mockService,
        $initialObject;

    beforeEach(function(){
        $modellaWrapper = modella.abstractor;
        $mockService = {
            post: function(){},
            put: function(){},
            delete: function(){}
        };
        $initialObject = {};
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

        var $returnedModel;

        beforeEach(function(){

            var modelConfig = {
                    parents: ["parent"],
                    children: ["child"],
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
                expect(JSON.stringify($returnedModel.parents)).toBe(JSON.stringify(["parent"]));
            });
        });

        describe("children", function(){
            it("should be an array on the returned model", function(){
                expect(typeof $returnedModel.children).toBe("object");
            });

            it("should match passed array", function(){
                expect(JSON.stringify($returnedModel.children)).toBe(JSON.stringify(["child"]));
            });
        });

    });

});
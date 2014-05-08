/*global describe,beforeEach,it,expect,modella,jasmine*/

describe("Modella extended object", function(){
    'use strict';

    var $model,
        $modelConfig,
        $mockService;

    beforeEach(function(){
        var $modellaWrapper = modella.extender,
            $initialObject = {
                id: '1234',
                parent_id: '1234a'
            };


        $mockService = {
                del: jasmine.createSpy("service.delete"),
                get: jasmine.createSpy("service.get"),
                getByParentId: jasmine.createSpy("service.getByParentId"),
                post: jasmine.createSpy("service.post"),
                put: jasmine.createSpy("service.put")
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
        }

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

    describe("rcopy (recursive copy)", function(){

        var $model;

        beforeEach(function(){
            var $modellaWrapper = modella.extender,
                childConfig = {
                    service: $mockService
                },
                initialObject = {
                    id: '1',
                    name: 'testObject',
                    dataStr: 'some random string',
                    kids: [
                        {
                            id: '23',
                            blah: 'blar'
                        },
                        {
                            id: '34',
                            blah: 'bloo'
                        }
                    ]
                },
                parentConfig = {
                    service: $mockService,
                    children: [{
                        name: 'kids',
                        baseConfig: childConfig
                    }],

                    initialObject: initialObject
                };

            $modellaWrapper.init(parentConfig, function(data){
                $model = data;
            });
        });

        it('should be a function', function(){
            expect(typeof $model.rcopy).toBe('function');
        });

        it('should return a copied top level object', function(){
            var returnedData = $model.rcopy();

            expect(returnedData.id).toBe('1');
        });

        it('should return copies of the child layers', function(){
            var returnedData = $model.rcopy();

            expect(returnedData.kids.length).toBe(2);
        });

        it('should call rcopy on the child models', function(){
            var rcopySpy = jasmine.createSpy('rcopy');

            $model.kids[0].rcopy = rcopySpy;
            $model.kids[1].rcopy = rcopySpy;

            $model.rcopy();

            expect(rcopySpy.calls.count()).toBe(2);
        });

    });

    describe("find", function(){

        var $model;

        beforeEach(function(){
            var $modellaWrapper = modella.extender,
                initialObject = {
                    id: '1',
                    name: 'testObject',
                    dataStr: 'some random string',
                    kids: [
                        {
                            id: '23',
                            blah: 'blar',
                            vals: [
                                {
                                    id: '24',
                                    name: ''
                                }
                            ]
                        },
                        {
                            id: '34',
                            blah: 'bloo'
                        }
                    ]
                },
                testConfig = {
                    service: $mockService
                },
                valConfig = {
                    service: $mockService
                },
                childConfig = {
                    service: $mockService,
                    children: [{
                        name: 'vals',
                        baseConfig: valConfig
                    }]
                },
                parentConfig = {
                    service: $mockService,
                    children: [
                        {
                            name: 'kids',
                            baseConfig: childConfig
                        },
                        {
                            name: 'tests',
                            baseConfig: testConfig
                        }
                    ],

                    initialObject: initialObject
                };

            $modellaWrapper.init(parentConfig, function(data){
                $model = data;
            });
        });

        it('should be a function', function(){
            expect(typeof $model.find).toBe('function');
        });

        it('should return null if not found', function(){
            var result = $model.find('foo', { id: '1234' });

            expect(result).toBe(null);
        });

        it('should return object if condition is met', function(){
            var result = $model.find('kid', { id: '34' });

            expect(result).toBe($model.kids[1]);
        });

        it('should return an object from lower layers if no object exists at current layer', function(){
            var result = $model.find('val', { id: '24' });

            expect(result).toBe($model.kids[0].vals[0]);
        });

    });

    describe("testNodeType", function(){

        var $model;

        beforeEach(function(){
            var $modellaWrapper = modella.extender,
                initialObject = {
                    id: '1',
                    name: 'testObject',
                    dataStr: 'some random string',
                    kids: [
                        {
                            id: '23',
                            blah: 'blar',
                            vals: [
                                {
                                    id: '24',
                                    name: ''
                                }
                            ]
                        },
                        {
                            id: '34',
                            blah: 'bloo'
                        }
                    ]
                },
                testConfig = {
                    service: $mockService
                },
                valConfig = {
                    service: $mockService
                },
                childConfig = {
                    service: $mockService,
                    children: [{
                        name: 'vals',
                        baseConfig: valConfig
                    }]
                },
                parentConfig = {
                    service: $mockService,
                    children: [
                        {
                            name: 'kids',
                            baseConfig: childConfig
                        },
                        {
                            name: 'tests',
                            baseConfig: testConfig
                        }
                    ],

                    initialObject: initialObject
                };

            $modellaWrapper.init(parentConfig, function(data){
                $model = data;
            });
        });

        it('should be a function', function(){
            expect(typeof $model.testNodeType).toBe('function');
        });

        it('should return false if node type does not exist at or below current level', function(){
            var nodeTypeExists = $model.testNodeType("foo");

            expect(nodeTypeExists).toBe(false);
        });

        it('should return true if node type exists at current level', function(){
            var nodeTypeExists = $model.testNodeType('kid');

            expect(nodeTypeExists).toBe(true);
        });

        it('should return true if node exists below current level', function(){
            var nodeTypeExists = $model.testNodeType('val');

            expect(nodeTypeExists).toBe(true);
        });
    });

});
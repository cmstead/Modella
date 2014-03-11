describe('Modella returned object', function(){
    var $modella,
        dataService,
        configAttributes;

    beforeEach(function(){

        dataService = {
            post: jasmine.createSpy("service.post"),
            put: jasmine.createSpy("service.put"),
            delete: jasmine.createSpy("service.delete")
        };

        configAttributes = {
            beforeSave: jasmine.createSpy("beforeSave"),
            beforeCreate: jasmine.createSpy("beforeCreate"),
            beforeUpdate: jasmine.createSpy("beforeUpdate"),
            beforeDelete: jasmine.createSpy("beforeDelete")
        };

        $modella = new modella();

    });

    describe("model.createRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeCreate: configAttributes.beforeCreate
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.post', function(){
            $model.createRecord();

            expect(dataService.post).toHaveBeenCalled();
        });

        it('should call beforeCreate', function(){
            $model.createRecord();

            expect(configAttributes.beforeCreate).toHaveBeenCalled();
        });

    });

    describe("model.updateRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeUpdate: configAttributes.beforeUpdate
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.put', function(){
            $model.updateRecord();

            expect(dataService.put).toHaveBeenCalled();
        });

        it('should call beforeUpdate', function(){
            $model.updateRecord();

            expect(configAttributes.beforeUpdate).toHaveBeenCalled();
        });


    });

    describe("model.deleteRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeDelete: configAttributes.beforeDelete
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.delete', function(){
            $model.deleteRecord();

            expect(dataService.delete).toHaveBeenCalled();
        });

        it('should call beforeDelete', function(){
            $model.deleteRecord();

            expect(configAttributes.beforeDelete).toHaveBeenCalled();
        });


    });

    describe("model.saveRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });

            $model.createRecord = jasmine.createSpy("createRecord");
            $model.updateRecord = jasmine.createSpy("updateRecord");
        });

        it('should call createRecord if no id exists', function(){
            $model.saveRecord();

            expect($model.createRecord).toHaveBeenCalled();
        });

        it('should call updateRecord if id exists', function(){
            $model.id = "1234";
            $model.saveRecord();

            expect($model.updateRecord).toHaveBeenCalled();
        });

    });

    describe("model.revise", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {
                    test1: "test 1",
                    test2: "test 2",
                    test3: "test 3"
                },
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model){
                $model = model;
            });

        });

        it('should be a function', function(){
            expect(typeof $model.revise).toBe('function');
        });

        it('should update values in the model based on passed object', function(){
            var updateObject = {
                    test1: "test value 1",
                    test3: "test value 3"
                },
                finalStr;

            $model.revise(updateObject);

            finalStr = $model.test1 + ", " + $model.test3;

            expect(finalStr).toBe("test value 1, test value 3");
        });

        it('should not update the function values', function(){
            var updateObj = { saveRecord: 'test' };
            $model.revise(updateObj);

            expect(typeof $model.saveRecord).toBe('function');
        });

    });

    describe('model.copy', function(){
        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {
                    test1: "test 1",
                    test2: "test 2",
                    test3: "test 3"
                },
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model){
                $model = model;
            });

        });

        it('should be a function', function(){
            expect(typeof $model.copy).toBe('function');
        });

        it('should return an object matching the stringified original model', function(){
            var returnedValue = $model.copy();

            expect(JSON.stringify($model)).toBe(JSON.stringify(returnedValue));
        });

        it('should return an object with no functions attached', function(){
            var returnedValue = $model.copy(),
                hasFunction = false;

            for(var key in returnedValue){
                if(typeof returnedValue[key] === 'function'){
                    hasFunction = true;
                }
            }

            expect(hasFunction).toBe(false);
        });
    });

});
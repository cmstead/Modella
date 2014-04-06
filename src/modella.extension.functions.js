/*global modella*/

(function($window){
    'use strict';

    var sanitizeCallback = modella.utilities.sanitizeCallback;

    /*
    * Appends a set of data to the original dataset passed in
    * @param (object) originalSet - original dataset to append to
    * @param (object) newSet - dataset to append to originalSet
    * @returns (object) extended originalSet
    */
    function appendSet(originalSet, newSet){
        newSet = (newSet) ? newSet : [];

        for(var key in newSet){
            originalSet[key] = newSet[key];
        }

        return originalSet;
    }

    /*
     * Builds a data appender function to pass as a callback
     * @param (object) dataObject - data object to append data to
     * @param (string) key - object key for data appending
     * @param (function) callback - callback to execute after appending data
     * @returns (function) dataAppender
     */
    function buildDataAppender(dataObject, key, callback){
        var sanitizedCallback = sanitizeCallback(callback);

        return function(data, error){
            if(data !== null){
                dataObject[key] = data;
            }

            sanitizedCallback(data, error);
        };
    }

    /*
    * Compiles a list of relative objectnames and relative type as specified
    * Not exposed to the world as this is an abstraction for reused code in getRelativesList
    * @param (object) relativeSet - dataset of parent/child data
    * @param (string) relativeType - type of relative data
    * @returns (object) relative set if relatives exist, empty object if none exist
    */
    function compileRelativeList(relativeSet, relativeType){
        var relativeList = {};

        relativeSet = (relativeSet) ? relativeSet : [];

        for(var key in relativeSet){
            var relativeName = relativeSet[key].name;
            relativeList[relativeName] = relativeType;
        }

        return relativeList;
    }

    /*
    * Locates record in dataset with matching id if record exists
    * @param (object) dataSet - set of records to search
    * @param (string) id - id to locate
    * @returns (object) record with matching id if found, null if not
    */
    function findRecordById(dataSet, id){
        var record = null;

        dataSet = (dataSet) ? dataSet : [];

        for(var key in dataSet){
            if(dataSet[key].id && dataSet[key].id === id){
                record = dataSet[key];
                break;
            }
        }

        return record;
    }

    /*
    * Compiles a list of names of parents and children in model
    * @param (object) model - data model to build list from
    * @returns (object) key/value set of names and types of relatives
    */
    function getRelativesList(model){
        var relativesList = {},
            parentList = compileRelativeList(model.parents, 'parent'),
            childList = compileRelativeList(model.children, 'child');

        relativesList = appendSet(relativesList, parentList);
        relativesList = appendSet(relativesList, childList);

        return relativesList;
    }

    /*
    * It verifies object exists and, if it's an array, that it contains elements
    * @param (object) dataObject
    * @returns (boolean) needsInitialization
    */
    function verifyObjectIsValid(dataObject){
        var isValid = (dataObject) ? true : false;

        if(Object.prototype.toString.call(dataObject) === '[object Array]' && !dataObject.length){
            isValid = false;
        }

        return isValid;
    }

    /*
    * Builds a new object wrapper around pointers to passed object
    * @param (object) dataObject - object to create pointers into
    * @returns (object) safeDataObject - an object from which pointers can be removed
    */
    function buildSafeObject(dataObject){
        var safeObject = {};

        dataObject = (dataObject) ? dataObject : {};

        for(var key in dataObject){
            if(dataObject.hasOwnProperty(key)){
                safeObject[key] = dataObject[key];
            }
        }

        return safeObject;
    }

    $window.modella.extension = {
        appendSet: appendSet,
        buildDataAppender: buildDataAppender,
        buildSafeObject: buildSafeObject,
        findRecordById: findRecordById,
        getRelativesList: getRelativesList,
        verifyObjectIsValid: verifyObjectIsValid
    };

})(window);
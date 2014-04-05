(function($window){
    'use strict';

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
    * Compiles a list of relative objectnames and relative type as specified
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

    $window.modella.extension = {
        appendSet: appendSet,
        findRecordById: findRecordById,
        getRelativesList: getRelativesList
    };

})(window);
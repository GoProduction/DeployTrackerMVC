﻿//Diff function, used to compare old values with new. Use by passing (OldDeploy, NewDeploy) parameters
var diff = function (obj1, obj2) {

    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
        return obj1;
    }

    //
    // Variables
    //

    var diffs = {};
    var key;


    //
    // Methods
    //

    /**
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     */
    var arraysMatch = function (arr1, arr2) {

        // Check if the arrays are the same length
        if (arr1.length !== arr2.length) return false;

        // Check if all items exist and are in the same order
        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }

        // Otherwise, return true
        return true;

    };

    /**
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} key   The key in our object
     */
    var compare = function (item1, item2, key) {

        // Get the object type
        var type1 = Object.prototype.toString.call(item1);
        var type2 = Object.prototype.toString.call(item2);

        // If type2 is undefined it has been removed
        if (type2 === '[object Undefined]') {
            diffs[key] = null;
            return;
        }

        // If items are different types
        if (type1 !== type2) {
            diffs[key] = item2;
            return;
        }

        // If an object, compare recursively
        if (type1 === '[object Object]') {
            var objDiff = diff(item1, item2);
            if (Object.keys(objDiff).length > 1) {
                diffs[key] = objDiff;
            }
            return;
        }

        // If an array, compare
        if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
                diffs[key] = item2;
            }
            return;
        }

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
                diffs[key] = item2;
            }
        } else {
            if (item1 !== item2) {
                diffs[key] = item2;
            }
        }

    };


    //
    // Compare our objects
    //

    // Loop through the first object
    for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key);
        }
    }

    // Loop through the second object and find missing items
    for (key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!obj1[key] && obj1[key] !== obj2[key]) {
                diffs[key] = obj2[key];
            }
        }
    }

    // Return the object of differences
    return diffs;

};
//PATCH data function using jQuery (default)
async function patchData(payload, model) {
    let result;
    try {
        result = await $.ajax({
            url: '/odata/Deploys(' + model.depID + ')',
            type: 'PATCH',
            async: true,
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json'
        });
        return result;
    }
    catch (err) {
        console.error(err);
    }
}
//Model for Deploy (when grabbed from DOM node/already binded record)
var Deploy = function (depID, depFeature, depVersion, depEnvironment, depPlannedDateTime, depStartTime, depEndTime, depStatus, depSmoke) {
    var self = this;
    self.depID = depID;
    self.depFeature = ko.observable(ko.utils.unwrapObservable(depFeature));
    self.depVersion = ko.observable(ko.utils.unwrapObservable(depVersion));
    self.depEnvironment = ko.observable(ko.utils.unwrapObservable(depEnvironment));
    self.depPlannedDateTime = ko.observable(new Date(ko.unwrap(depPlannedDateTime)));
    self.depStartTime = ko.observable(ko.utils.unwrapObservable(depStartTime));
    self.depEndTime = ko.observable(ko.utils.unwrapObservable(depEndTime));
    self.depStatus = ko.observable(ko.utils.unwrapObservable(depStatus));
    self.depSmoke = ko.observable(ko.utils.unwrapObservable(depSmoke));
    console.log("Planned time is: ", ko.utils.unwrapObservable(self.depPlannedDateTime));
}
//Model for Deploy when passing from server/newly submitted
var incomingDeploy = function (depID, depFeature, depVersion, depEnvironment, depPlannedDateTime, depStartTime, depEndTime, depStatus, depSmoke) {
    var self = this;
    self.depID = depID;
    self.depFeature = ko.observable(depFeature);
    self.depVersion = ko.observable(depVersion);
    self.depEnvironment = ko.observable(depEnvironment);
    self.depPlannedDateTime = ko.observable(depPlannedDateTime);
    self.depStartTime = ko.observable(depStartTime);
    self.depEndTime = ko.observable(depEndTime);
    self.depStatus = ko.observable(depStatus);
    self.depSmoke = ko.observable(depSmoke);

}

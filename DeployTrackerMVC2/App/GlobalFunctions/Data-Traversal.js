//GET requests

//PATCH requests
async function patchDeploy(payload, model) {
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
async function patchNote(payload, model) {
    let result;
    try {
        result = await $.ajax({
            url: '/odata/NoteBodies(' + model.id + ')',
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
//POST requests
async function postComment(signalR, payload) {
    let result;
    try {
        result = await $.ajax({
            url: "/api/CommentAPI",
            type: "POST",
            async: true,
            mimeType: "text/html",
            data: JSON.stringify(payload),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                var response = JSON.stringify(payload);
                signalR.server.updateComments(response);
                console.log("postComment() ", data);
                
            }
        });
    }
    catch (msg) {
        console.log("error: ", msg.status);
        console.log(msg.statusText);
        console.log(msg.responseText);
        console.log("Ready state: ", msg.readyState);
    }
}
async function postDeploy(signalR, payload) {
    let result;
    try {
        result = await $.ajax({
            url: "/api/DeployAPI",
            type: "POST",
            async: true,
            mimeType: "text/html",
            data: JSON.stringify(payload),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                var response = JSON.stringify(data);
                signalR.server.updateAll(response);
                console.log("postDeploy() ", data);

            }
        });
    }
    catch (msg) {
        console.log("error: ", msg.status);
        console.log(msg.statusText);
        console.log(msg.responseText);
        console.log("Ready state: ", msg.readyState);
    }  
}
async function postNote(signalR, payload, noteBody) {
    let result;
    var noteID = null;
    //Post note info
    try {
        result = await $.ajax({
            url: '/api/NotesAPI',
            type: 'POST',
            async: true,
            mimeType: 'text/html',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                var response = JSON.stringify(data);
                noteID = data.noteID;
                console.log("response for tblNotes: ", response);
                signalR.server.updateNotes(response);
                successToast("Note has been successfully submitted.");
            }
        });
    }
    catch (msg) {
        console.log("error: ", msg.status);
        console.log(msg.statusText);
        console.log(msg.responseText);
        console.log("Ready state: ", msg.readyState);
    }
    //Post note body
    try {
        var payloadBody = {};
        payloadBody['noteID'] = noteID;
        payloadBody['body'] = noteBody;
        //console.log("NoteBody payload is: ", JSON.stringify(payload));
        result = await $.ajax({
            url: '/api/NoteBodiesAPI',
            type: 'POST',
            async: true,
            mimeType: 'text/html',
            data: JSON.stringify(payloadBody),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                var response = JSON.stringify(data);
                console.log("Note body: ", response);
            }
        });
    }
    catch (msg) {
        console.log("error: ", msg.status);
        console.log(msg.statusText);
        console.log(msg.responseText);
        console.log("Ready state: ", msg.readyState);
    }
};

//DELETE requests
async function deleteDeploy(signalR, model) {
    $.ajax({
        url: '/api/DeployAPI/' + model.depID,
        type: 'DELETE',
        success: function (result) {
            signalR.server.removeDeploy(model.depID);
            
        }
    });
}
//Model for Deploy (when grabbed from DOM node/already binded record)
var Deploy = function (id, feature, version, environment, plannedDateTime, startTime, endTime, status, smoke, note) {
    var self = this;
    self.depID = id;
    self.feaID = ko.observable(ko.utils.unwrapObservable(feature));
    self.depVersion = ko.observable(ko.utils.unwrapObservable(version));
    self.envID = ko.observable(ko.utils.unwrapObservable(environment));
    self.depPlannedDateTime = ko.observable(new Date(ko.unwrap(plannedDateTime)));
    self.depStartTime = ko.observable(ko.utils.unwrapObservable(startTime));
    self.depEndTime = ko.observable(ko.utils.unwrapObservable(endTime));
    self.statusID = ko.observable(ko.utils.unwrapObservable(status));
    self.smokeID = ko.observable(ko.utils.unwrapObservable(smoke));
    self.noteID = ko.observable(ko.utils.unwrapObservable(note));
    console.log("Planned time is: ", ko.utils.unwrapObservable(self.depPlannedDateTime));
}
//Model for Comment
var Comment = function (id, body, dateTime, user, depID) {
    var self = this;
    self.comID = id;
    self.comBody = ko.observable(body);
    self.comDateTime = ko.observable(dateTime);
    self.comUser = ko.observable(user);
    self.depID = ko.observable(depID);
}
//Model for Deploy when passing from server/newly submitted
var incomingDeploy = function (id, feature, version, environment, plannedDateTime, startTime, endTime, status, smoke, note) {
    var self = this;
    self.depID = id;
    self.feaID = ko.observable(feature);
    self.depVersion = ko.observable(version);
    self.envID = ko.observable(environment);
    self.depPlannedDateTime = ko.observable(plannedDateTime);
    self.depStartTime = ko.observable(startTime);
    self.depEndTime = ko.observable(endTime);
    self.statusID = ko.observable(status);
    self.smokeID = ko.observable(smoke);
    self.noteID = ko.observable(note);

}
//Model for quick deploy
var QuickDeploy = function (id, version, environment, plannedDateTime, startTime, status, smoke) {
    this.feaID = id;
    this.depVersion = version;
    this.envID = environment;
    this.depPlannedDateTime = plannedDateTime;
    this.depStartTime = startTime;
    this.statusID = status;
    this.smokeID = smoke;
}
//Note model used for knockout binding
var Note = function (id, dateTime, visID) {
    this.noteID = id;
    this.noteVisID = visID;
    this.noteDateTime = ko.observable(dateTime);
}
//Note model used for POST request compatability
var NewNote = function (dateTime, visID) {
    this.noteDateTime = dateTime;
    this.noteVisID = visID;
}
var NoteBody = function (id, body) {
    this.id = id;
    this.body = ko.observable(body);
}
//Status modal model
var StatusVariables = function (id, feature, version, status, smoke) {
    this.id = id;
    this.feature = feature;
    this.version = version;
    this.status = status;
    this.smoke = smoke;
}

//Calculates the difference in hours between two dates
function dateTimeDifference(date) {
    var now = new Date();
    var then = new Date(date);
    var hours = Math.abs(now.valueOf() - then.valueOf()) / 3600000
    return hours;
}
//Returns today's date
function dateNow() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset());
}
//Formats date for timezone-offset
function dateForTimezone(date) {
    return moment(new Date(date.getTime() + date.getTimezoneOffset())).format();
}

//Helper functions
var featureFromID = function (id, observableArray) {
    return ko.utils.arrayFirst(observableArray, function (item) {
        if (item.feaID == id) {
            //console.log("feaName: ", ko.unwrap(item.feaName));
            return ko.unwrap(item.feaName);
        }
    })
};
var environmentFromID = function (id, observableArray) {
    return ko.utils.arrayFirst(observableArray, function (item) {
        if (item.envID == id) {
            //console.log("envName: ", ko.unwrap(item.envName));
            return ko.unwrap(item.envName);
        }
    })
};
var noteFromID = function (id, observableArray) {
    return ko.utils.arrayFirst(observableArray, function (item) {
        if (item.noteID == id) {
            //console.log("envName: ", ko.unwrap(item.noteVisID));
            return ko.unwrap(item.noteVisID);
        }
    })
};
var statusFromID = function (id, observableArray) {
    return ko.utils.arrayFirst(observableArray, function (item) {
        if (item.statusID == id) {
            //console.log("envName: ", ko.unwrap(item.noteVisID));
            return ko.unwrap(item.statusName);
        }
    })
};
var smokeFromID = function (id, observableArray) {
    return ko.utils.arrayFirst(observableArray, function (item) {
        if (item.smokeID == id) {
            //console.log("envName: ", ko.unwrap(item.noteVisID));
            return ko.unwrap(item.smokeName);
        }
    })
};

//Diff function, used to compare old values with new. Use by passing (OldDeploy, NewDeploy) parameters
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
function findNote(id, arrayName) {
    return ko.utils.arrayFirst(arrayName, function (item) {
        if (item.noteID == id) {
            console.log("findNote()", ko.utils.unwrapObservable(item));
            return item;
        }
    });
}
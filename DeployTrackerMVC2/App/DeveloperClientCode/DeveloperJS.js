//Knockout find function (used for filter)
ko.observableArray.fn.find = function (prop, data) {
    var valueToMatch = data[prop];
    return ko.utils.arrayFirst(this(), function (item) {
        return item[prop] === valueToMatch;
    });
};

//MAIN VIEW MODEL
var DeployViewModel = function (deploySignalR, curTypeCached, curTimeCached, smokeTypeCached, smokeTimeCached) {

    var self = this;
    //Current loadingVar max value is 6
    var loadingVar = 0;
    var loadingVarMax = 7;

    //Finder functions
    self.featureFromID = function (id) {
        return ko.utils.arrayFirst(self.feature(), function (item) {
            if (item.feaID == id) {
                //console.log("feaName: ", ko.unwrap(item.feaName));
                return ko.unwrap(item.feaName);
            }
        })
    };
    self.environmentFromID = function (id) {
        return ko.utils.arrayFirst(self.environment(), function (item) {
            if (item.envID == id) {
                //console.log("envName: ", ko.unwrap(item.envName));
                return ko.unwrap(item.envName);
            }
        })
    };
    self.noteFromID = function (id) {
        return ko.utils.arrayFirst(self.note(), function (item) {
            if (item.noteID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.noteVisID);
            }
        })
    };
    self.noteBodyFromID = function (id) {
        try {
            return ko.utils.arrayFirst(self.note(), function (item) {
                if (item.noteID == id) {
                    return ko.unwrap(item.noteBody);
                }
            })
        }
        catch (error) {
            errorToast(error);
        }

    };
    self.smokeFromID = function (id) {
        return ko.utils.arrayFirst(self.smoke(), function (item) {
            if (item.smokeID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.smokeName);
            }
        })
    };
    self.statusFromID = function (id) {
        return ko.utils.arrayFirst(self.status(), function (item) {
            if (item.statusID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.statusName);
            }
        })
    };

    //Dynamic observables for status modal
    self.statusModalFeature = ko.observable();
    self.statusModalVersion = ko.observable();

    //FILTER OBSERVABLES FOR TABLES
    self.typeArray = ko.observableArray([
        { text: 'All Current Deploys', val: 'All' },
        { text: 'Deploying', val: 2 },
        { text: 'Completed', val: 3 },
        { text: 'Failed', val: 4 }
    ]) //Used for type filter
    self.timeArray = ko.observableArray([
        { text: 'Past 24 hours', val: '24' },
        { text: 'Past 7 days', val: '168' },
        { text: 'Past month', val: '730' }
    ]); //Used for time filter
    self.currentSelectedType = ko.observable(self.typeArray.find("val", curTypeCached));
    self.currentSelectedTime = ko.observable(self.timeArray.find("val", curTimeCached));

    //OBSERVABLE ARRAYS
    self.deploy = ko.observableArray(); // Deploy observable array that will be called through HTML
    self.feature = ko.observableArray(); // Feature observable array that will be used to populate feature drop-down
    self.environment = ko.observableArray(); // Environment observable array that will be used to populate environment drop-down
    self.status = ko.observableArray(); // Status observable array
    self.smoke = ko.observableArray(); //Smoke observable array
    self.comment = ko.observableArray(); // Comment observable array
    self.note = ko.observableArray();
    self.selected = ko.observableArray(self.deploy()[0]); //Determines if record is selected

    //ObSERVABLES
    self.obsCheckEdit = ko.observable(0); // Observable that is used to check if any field is being edited
    self.obsID = ko.observable(''); // Observable that is used to filter any results by ID
    self.deployBeingEdited = ko.observable(0);
    self.originalDeploy = ko.observable(0);
    self.tempTime = ko.observable(new Date());

    //FUNCTIONS
    self.dateAndUser = function (date, user) {
        return moment(date, 'MMM DD YYYY') + " " + user;
    }
    self.selectRecord = function (data) {

        self.selected(data);
        selID = self.selected().depID;
        self.obsID(selID);
        console.log("obsID: ");
        console.log(self.obsID);
        console.log("selID: ");
        console.log(selID);

    }; // Run when record is selected, and open the record modal
    self.updateViewModel = function (payload) {
        var jvsObject = JSON.parse(payload);
        var newDeploy = new incomingDeploy(
            jvsObject.depID,
            jvsObject.feaID,
            jvsObject.depVersion,
            jvsObject.envID,
            jvsObject.depPlannedDateTime,
            jvsObject.depStartTime,
            jvsObject.depEndTime,
            jvsObject.statusID,
            jvsObject.smokeID,
            jvsObject.noteID);
        console.log("New JS object", jvsObject);
        self.deploy.push(newDeploy);
        self.watchModel(newDeploy, self.modelChanged);
        
    } // Updates the viewmodel when new DEPLOYS have been submitted
    self.updateViewModelComment = function (payload) {
        var jvsObject = JSON.parse(payload);
        var newComment = new Comment(
            jvsObject.comID,
            jvsObject.comBody,
            jvsObject.comDateTime,
            jvsObject.comUser,
            jvsObject.depID
        );
        console.log("New comment: ", jvsObject);
        self.comment.push(newComment);
    } // Updates the viewmodel when new COMMENT has been submitted
    self.updateViewModelNote = function (payload) {
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(
            jvsObject.noteID,
            jvsObject.noteBody,
            jvsObject.noteDateTime,
            jvsObject.noteVisID
        );
        console.log("Pushed new note to array");
        self.note.push(newNote);
    }
    self.removeDeploy = function (deploy) {
        self.deploy.remove(deploy);
    }
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key])) {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                    console.log("self.watchModel()", callback(model, key, val));
                });
            }
        }
    }
    
    // Checks to make sure properties are observable
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            console.log("self.subscribeToProperty");
            callback(key, val);
        });
    } // Subscribes to observable objects, and listens for changes
    self.checkObservables = function () {
        console.log("originalDeploy:");
        console.log(self.originalDeploy);
        console.log("deployBeingEdited:");
        console.log(self.deployBeingEdited);
    }

    //modelChanged function, to trigger when a row value changes (with jQuery PATCH request)
    //PATCH request will only send the changed property to the database, minimizing network traffic
    self.modelChanged = function (model, key, val) {
        var payload = {};
        payload[key] = val;
        console.log("self.modelChanged()", payload);
    };
    
    //GET REQUESTS
    $.getJSON('/odata/Deploys', function (data) {
        self.deploy(ko.utils.arrayMap(data.value, function (deploy) {
            var obsDeploy = {
                depID: deploy.depID,
                feaID: ko.observable(deploy.feaID),
                envID: ko.observable(deploy.envID),
                smokeID: ko.observable(deploy.smokeID),
                statusID: ko.observable(deploy.statusID),
                noteID: ko.observable(deploy.noteID),
                depVersion: ko.observable(deploy.depVersion),
                depPlannedDateTime: ko.observable(deploy.depPlannedDateTime),
                depStartTime: ko.observable(deploy.depStartTime),
                depEndTime: ko.observable(deploy.depEndTime)
                
            }

            return obsDeploy;

        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Deploys");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Fetches data from Deploys table
    $.getJSON('/odata/Features', function (data) {
        self.feature(ko.utils.arrayMap(data.value, function (feature) {
            var obsFeature = {
                feaID: feature.feaID,
                feaName: ko.observable(feature.feaName)
            }
            
            return obsFeature;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Features");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Fetches data from Features table
    $.getJSON('/odata/Environments', function (data) {
        self.environment(ko.utils.arrayMap(data.value, function (environment) {
            var obsEnvironment = {
                envID: environment.envID,
                envName: ko.observable(environment.envName)
            }
            
            return obsEnvironment;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, "loaded Environments");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Environments table
    $.getJSON('/odata/Status', function (data) {
        self.status(ko.utils.arrayMap(data.value, function (status) {
            var obsStatus = {
                statusID: status.statusID,
                statusName: ko.observable(status.statusName)
            };

            return obsStatus;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Status");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Status table
    $.getJSON('/odata/Smokes', function (data) {
        self.smoke(ko.utils.arrayMap(data.value, function (smoke) {
            var obsSmoke = {
                smokeID: smoke.smokeID,
                smokeName: ko.observable(smoke.smokeName)
            };

            return obsSmoke;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Smoke");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Status table
    $.getJSON('/odata/Comments', function (data) {
        self.comment(ko.utils.arrayMap(data.value, function (comment) {
            var obsComment = {
                comID: comment.comID,
                comBody: ko.observable(comment.comBody),
                comDateTime: ko.observable(new Date(comment.comDateTime)),
                comUser: ko.observable(comment.comUser),
                depID: ko.observable(comment.depID)
            }
            
            return obsComment;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Comments");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Comments table
    $.getJSON('/odata/Notes', function (data) {
        self.note(ko.utils.arrayMap(data.value, function (data) {
            var obsNote = {
                noteID: data.noteID,
                noteBody: ko.observable(data.noteBody),
                noteDateTime: ko.observable(new Date(data.noteDateTime)),
                noteVisID: ko.observable(data.noteVisID),
                depID: ko.observable(data.depID)
            }

            return obsNote;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Notes");
        if (loadingVar == loadingVarMax) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Notes table

    ///TABLE FILTERS
    self.queuedDeploys = ko.computed(function () {
        var filteredValue = 1;
        var filtered = filteredValue ? ko.utils.arrayFilter(self.deploy(), function (rec) {
            return rec.statusID() === 1;
        }) : self.deploy();

        return filtered.sort(function (l, r) {
            console.log("Sorted queued deploys");
            return (l.depPlannedDateTime() > r.depPlannedDateTime() ? 1 : -1)
        });
    });// Queued Deploys table filter
    self.currentDeploys = ko.computed(function () {
        return ko.utils.arrayFilter(self.deploy(), function (rec) {

            var date = rec.depStartTime();
            var val = dateTimeDifference(date);

            if (val <= self.currentSelectedTime().val) {
                if (self.currentSelectedType().val != 'All') {
                    return (rec.statusID() === self.currentSelectedType().val)
                }
                else {
                    return (rec.statusID() === 2 || rec.statusID() === 3 || rec.statusID() === 4)
                }

            };

        });
    }); // Current Deploys table filter
    self.commentsFiltered = ko.computed(function () {
        return ko.utils.arrayFilter(self.comment(), function (rec) {
            return rec.depID() == self.deployBeingEdited().depID;
        });
    }); // Filters the comments section based on record selected

    ///STATUS MODAL FUNCTIONS
    self.openModal = function (deploy) {

        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var smokeMenu = document.getElementById("ctlSmokeStatus");

        smokeMenu.options[2].disabled = true;
        smokeMenu.options[3].disabled = true;
        smokeMenu.options[4].disabled = true;

        ctl.value = deploy.statusID();
        objstatus = deploy.statusID();
        smokeMenu.value = deploy.smokeID();
        console.log(objstatus);
        id.value = deploy.depID;
        console.log("feaID is :", ko.unwrap(deploy.feaID()));
        
        self.statusModalFeature(deploy.feaID());
        self.statusModalVersion(deploy.depVersion());

        modal.style.display = "block";
        console.log('modal triggered');

        window.onclick = function (event) {
            if (event.target == modal) {
                self.closeModal();
            }
        }
    } // Open Modal
    self.closeModal = function () {
        var error = document.getElementById("errorStatusModalChange");
        var smokeDiv = document.getElementById("smoke-div");
        $("#statusModal").fadeOut();
        $("#commentBody").fadeOut();
        error.style.display = "none";
        smokeDiv.style.display = 'none';

    } // Close Modal
    self.submitStatus = function () {
        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var errorMsg = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentField");
        var smokeField = document.getElementById("ctlSmokeStatus");
        var feature = document.getElementById("spFeature").innerText;
        var version = document.getElementById("spVersion").innerText;

        //JSON payload
        var payload = {};

        //Checks if status has NOT been changed
        if (objstatus == ctl.value) {
            if (errorMsg.style.display == "none") {
                errorMsg.style.display = "block";
                errorMsg.textContent = "You must change the status field in order to submit. Please select a new status, or select Cancel.";
            }
            else {
                errorMsg.style.display = "none";
            }

            return;
        }
        //Checks if status was set to failed, but comment was NOT entered
        if (ctl.value == 4 && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter a comment before you can submit the status as FAILED.";
            return;
        }

        ko.utils.arrayForEach(self.deploy(), function (mainItem) {

            if (id.value == mainItem.depID) {
                //If its marked as Completed
                if (ctl.value == 3) {
                    //Assign and format properties
                    mainItem.statusID(ctl.value);
                    mainItem.depEndTime(moment(dateNow()).format());
                    mainItem.smokeID(smokeField.value);
                    //(Test log)
                    console.log(smokeField.value);
                    console.log(mainItem.depEndTime());
                    //Push properties to JSON payload
                    payload["statusID"] = ko.utils.unwrapObservable(mainItem.statusID);
                    payload["depEndTime"] = ko.utils.unwrapObservable(mainItem.depEndTime);
                    payload["smokeID"] = ko.utils.unwrapObservable(mainItem.smokeID);
                }
                //If its marked as Failed
                else if (ctl.value == 4) {
                    //Comment JSON string
                    var json = {};
                    //json["odata.type"] = "DeployTrackerMVC2.tblComment";
                    json["comBody"] = comment.value;
                    json["comDateTime"] = dateNow();
                    json["depID"] = id.value;
                    console.log(JSON.stringify(json));
                    postComment(deploySignalR, json);

                    //Assign and format properties
                    mainItem.statusID(ctl.value);
                    mainItem.depEndTime(moment(dateNow()).format());
                    //(Test log)
                    console.log(mainItem.depEndTime());
                    //Push properties to JSON payload
                    payload["statusID"] = ko.utils.unwrapObservable(mainItem.statusID);
                    payload["depEndTime"] = ko.utils.unwrapObservable(mainItem.depEndTime)
                    
                    
                }
                //If its marked as Deploying
                else if (ctl.value == 2) {
                    //Assign and format properties
                    mainItem.statusID(ctl.value);
                    mainItem.depStartTime(moment(dateNow()).format());
                    //Push properties to JSON payload
                    payload["statusID"] = ko.utils.unwrapObservable(mainItem.statusID);
                    payload["depStartTime"] = ko.utils.unwrapObservable(mainItem.depStartTime);
                    //(Test log)
                    console.log(mainItem.depStartTime());
                }
                else {
                    mainItem.statusID(ctl.value);
                    payload["statusID"] = ko.utils.unwrapObservable(mainItem.statusID);
                }
                
                console.log(payload);
                //Call the PATCH request
                patchDeploy(payload, mainItem);
                //deploySignalR.server.updateAll();
            }

        });
        var lookup = self.statusFromID(ctl.value);
        var notifValue = String(lookup);
        checkForNotification(notifValue, feature, version, deploySignalR);
        comment.value = "";
        self.closeModal();
    } // Submit new status
    self.submitComment = function () {
        var commentField = document.getElementById("recordCommentField");
        if (commentField.value.trim() == "") {
            console.log("Empty comment field... can not continue.");
            return;
        }
        //Prepare value for POSTing comment
        var payload = {};
        payload["comBody"] = commentField.value;
        payload["comDateTime"] = dateNow();
        payload["depID"] = self.deployBeingEdited().depID;
        //POST comment
        postComment(deploySignalR, payload);
        //Disable the comment field
        cancelComment();
    } //Submit new comment (in RECORD DETAILS modal)

    //RECORD MODAL FUNCTIONS
    self.enableEdit = function () {
        //Input fields
        document.getElementById("editFeature").disabled = false;
        document.getElementById("editVersion").disabled = false;
        document.getElementById("editEnvironment").disabled = false;
        document.getElementById("editPlannedDate").disabled = false;
        document.getElementById("editPlannedTime").disabled = false;
        //Prep smoke drop-down for edit by evaluation
        var smokeField = document.getElementById("editSmoke");
        var smokeValue = smokeField.options[smokeField.selectedIndex].text;
        evalSmoke(smokeField, smokeValue);
        //Disable last three fields in drop-down
        smokeField.options[2].disabled = true;
        smokeField.options[3].disabled = true;
        smokeField.options[4].disabled = true;

        //Footer divs
        document.getElementById('footerEditDisabled').style.display = 'none';
        document.getElementById('footerEditEnabled').style.display = 'block';
        console.log("Edit enabled");
    }
    self.disableEdit = function () {
        //Input fields
        document.getElementById("editFeature").disabled = true;
        document.getElementById("editVersion").disabled = true;
        document.getElementById("editEnvironment").disabled = true;
        document.getElementById("editPlannedDate").disabled = true;
        document.getElementById("editPlannedTime").disabled = true;
        document.getElementById("editSmoke").disabled = true;
        //Footer divs
        document.getElementById('footerEditDisabled').style.display = 'block';
        document.getElementById('footerEditEnabled').style.display = 'none';
        console.log("Edit disabled");
    }
    self.edit = function (deploy) {
        self.originalDeploy(deploy);
        self.deployBeingEdited(new Deploy(
            deploy.depID,
            deploy.feaID,
            deploy.depVersion,
            deploy.envID,
            deploy.depPlannedDateTime,
            deploy.depStartTime,
            deploy.depEndTime,
            deploy.statusID,
            deploy.smokeID,
            deploy.noteID));
        self.directToRecordPage();
        self.disableEdit();
        console.log("Original deploy: ", ko.toJS(self.originalDeploy));
        console.log("Deploy being viewed is: ", ko.toJS(self.deployBeingEdited));


    } // Function to enable the edit-template, AND trigger the signalr LOCK event for all other clients
    self.cancelEdit = function () {
        self.deployBeingEdited(new Deploy(
            self.originalDeploy().depID,
            self.originalDeploy().feaID,
            self.originalDeploy().depVersion,
            self.originalDeploy().envID,
            self.originalDeploy().depPlannedDateTime,
            self.originalDeploy().depStartTime,
            self.originalDeploy().depEndTime,
            self.originalDeploy().statusID,
            self.originalDeploy().smokeID,
            self.originalDeploy().noteID
        ));
        self.disableEdit();
    }
    self.done = function () {

        //Prep properties for PATCH request
        var oldDeploy = ko.toJS(self.originalDeploy());
        var newDeploy = ko.toJS(self.deployBeingEdited());
        var payload = diff(oldDeploy, newDeploy);
        if ('depPlannedDateTime' in payload) {
            console.log("Date change from: ", payload, " to :", moment(payload.depPlannedDateTime).format());
            payload.depPlannedDateTime = moment(payload.depPlannedDateTime).format();
        }
        console.log("Change payload: ", payload);
        //Send the PATCH request
        patchDeploy(payload, self.originalDeploy());

        //Assign changes to variables
        var updatedDeploy = ko.utils.unwrapObservable(self.deployBeingEdited());
        var depID = updatedDeploy.depID;
        var feaID = ko.utils.unwrapObservable(updatedDeploy.feaID);
        var depVersion = ko.utils.unwrapObservable(updatedDeploy.depVersion);
        var envID = ko.utils.unwrapObservable(updatedDeploy.envID);
        var depPlannedDateTime = dateForTimezone(ko.utils.unwrapObservable(updatedDeploy.depPlannedDateTime));
        var depStartTime = ko.utils.unwrapObservable(updatedDeploy.depStartTime);
        var depEndTime = ko.utils.unwrapObservable(updatedDeploy.depEndTime);
        var statusID = ko.utils.unwrapObservable(updatedDeploy.statusID);
        var smokeID = ko.utils.unwrapObservable(updatedDeploy.smokeID);
        var noteID = ko.utils.unwrapObservable(updatedDeploy.noteID);
        //Update deploy with assigned variables
        self.originalDeploy().depID = depID;
        self.originalDeploy().feaID(feaID);
        self.originalDeploy().depVersion(depVersion);
        self.originalDeploy().envID(envID);
        self.originalDeploy().depPlannedDateTime(depPlannedDateTime);
        self.originalDeploy().depStartTime(depStartTime);
        self.originalDeploy().depEndTime(depEndTime);
        self.originalDeploy().statusID(statusID);
        self.originalDeploy().smokeID(smokeID);
        self.originalDeploy().noteID(noteID);

        //Disable the edit fields
        self.disableEdit();

    } // Function to disable the 'LOCKED' status of the row
    self.directToRecordPage = function () {
        var notePage = document.getElementById("notePage");
        var recordPage = document.getElementById("recordPage");
        notePage.style.display = "none";
        recordPage.style.display = "block";
    }
    self.directToNotePage = function () {
        var notePage = document.getElementById("notePage");
        var recordPage = document.getElementById("recordPage");
        notePage.style.display = "block";
        recordPage.style.display = "none";
    }
    

    ///DELETE MODAL FUNCTIONS
    self.openDeleteModal = function (deploy) {
        var modal = document.getElementById("deleteModal");
        modal.style.display = "block";
        self.selected(deploy);
        console.log(self.selected().feaID);
        window.onclick = function (event) {
            if (event.target == modal) {
                self.closeDeleteModal();
            }
        }
    }
    self.closeDeleteModal = function () {
        $("#deleteModal").fadeOut();
    }
    self.deleteRecord = function () {
        var model = self.selected();
        deleteDeploy(deploySignalR, model);
        self.closeDeleteModal();
    }

    //QUICK DEPLOY MODAL FUNCTIONS
    self.openQDModal = function () {
        var modal = document.getElementById("quickDeployModal");
        modal.style.display = "block";
        window.onclick = function (event) {
            if (event.target == modal) {
                self.closeQDModal();
            }
        }
    }
    self.closeQDModal = function () {
        $("#quickDeployModal").fadeOut();
    }
    self.submitQD = function () {
        var ctlFeature = document.getElementById("qdFeature");
        var ctlVersion = document.getElementById("qdVersion");
        var ctlEnvironment = document.getElementById("qdEnvironment");

        if (ctlVersion.value.length == 0) {
            errorToast("You must enter a version number");
            return;
        }

        var newDeploy = new QuickDeploy(
            ctlFeature.value,
            ctlVersion.value,
            ctlEnvironment.value,
            dateForTimezone(dateNow()),
            dateForTimezone(dateNow()),
            2,
            1
        );
        postDeploy(deploySignalR, newDeploy);
        self.closeQDModal();
    }

    //SORTING FUNCTION
    self.sortByDate = function (l, r) {

        return ((l.depEndTime() == r.depEndTime()) ? (l.depEndTime() < r.depEndTime() ? 1 : -1) : (l.depStartTime() < r.depStartTime() ? 1 : -1))
    }
    self.sortQueue = function () {
        self.queuedDeploys().slice(0).sort();
    }

    //CACHING FUNCTIONS/////////////////////////////////////////////
    self.cacheCurrentType = function () {
        var ctl = document.getElementById("ctlCurrentType");
        var sel = ctl.options[ctl.selectedIndex];
        if (ctl.selectedIndex == 0) {
            curTypeCached = { val: "All" };
            localStorage['curTypeCached'] = JSON.stringify(curTypeCached);

        }
        else {
            curTypeCached = { val: sel.text };
            localStorage['curTypeCached'] = JSON.stringify(curTypeCached);

        }

        console.log("Cached as ");
        console.log(curTypeCached);
    }
    self.cacheCurrentTime = function () {
        var ctl = document.getElementById("ctlCurrentTime");
        if (ctl.selectedIndex == 0) {
            curTimeCached = { val: '24' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
        else if (ctl.selectedIndex == 1) {
            curTimeCached = { val: '168' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
        else if (ctl.selectedIndex == 2) {
            curTimeCached = { val: '730' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
    }
    self.cacheSmokeType = function () {
        var ctl = document.getElementById("ctlSmokeType");
        var sel = ctl.options[ctl.selectedIndex];
        if (ctl.selectedIndex == 0) {
            smokeTypeCached = { val: "All" };
            localStorage['smokeTypeCached'] = JSON.stringify(smokeTypeCached);

        }
        else {
            smokeTypeCached = { val: sel.text };
            localStorage['smokeTypeCached'] = JSON.stringify(smokeTypeCached);

        }

        console.log("Cached as ");
        console.log(smokeTypeCached);
    }
    self.cacheSmokeTime = function () {
        var ctl = document.getElementById("ctlSmokeTime");
        if (ctl.selectedIndex == 0) {
            smokeTimeCached = { val: '24' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
        else if (ctl.selectedIndex == 1) {
            smokeTimeCached = { val: '168' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
        else if (ctl.selectedIndex == 2) {
            smokeTimeCached = { val: '730' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
    }
    self.loadCurrentType = function (option, item) {

        ko.applyBindingsToNode(option.parentElement, self.currentSelectedType, item);
        console.log("CurrentOption is loaded as: ");
        console.log(self.CurrentOption);
    }

    //Css class evaluation for table rows
    self.rowColor = function (deploy) {
        if (deploy.statusID() == 2) {
            return 'css-deploying';
        }
        else if (deploy.statusID() == 4) {
            return 'css-deploy-failed';
        }
        else if (deploy.smokeID() == 3) {
            return 'css-smoke-pass';
        }
        else if (deploy.smokeID() == 4) {
            return 'css-smoke-conditional';
        }
        else if (deploy.smokeID() == 5) {
            return 'css-smoke-failed';
        }
        else if (deploy.statusID() == 3 && deploy.smokeID() == 1) {
            return 'css-deploy-failed';
        }
        else {
            return null;
        }
    };
    self.statusIcon = function (deploy) {
        //Deploying
        if (deploy.statusID() == 2) {
            return 'fa fa-spinner';
        }
        //Completed
        else if (deploy.statusID() == 3) {
            return 'fa fa-check';
        }
        //Failed
        else if (deploy.statusID() == 4) {
            return 'fa fa-times';
        }
        else {
            return null;
        }
    }
    self.smokeIcon = function (deploy) {
        //Pass
        if (deploy.smokeID() == 3) {
            return 'fa fa-check';
        }
        //Conditional
        else if (deploy.smokeID() == 4) {
            return 'fa fa-wrench';
        }
        //Fail
        else if (deploy.smokeID() == 5) {
            return 'fa fa-times';
        }
        else {
            return null;
        }
    }
}

//SignalR Events
$(function () {
    
    $("editPlannedDate").datepicker();
    var deploySignalR = $.connection.deploy;
    var viewModel = new DeployViewModel(deploySignalR, curTypeCached, curTimeCached, smokeTypeCached, smokeTimeCached);
    var findDeploy = function (id) {
        return ko.utils.arrayFirst(viewModel.deploy(), function (item) {
            if (item.depID == id) {
                //console.log("findDeploy()", ko.utils.unwrapObservable(item));
                return item;
            }
        });
    }; // Deploy helper function
    var findNote = function (id) {
        return ko.utils.arrayFirst(viewModel.note(), function (item) {
            if (item.noteID == id) {
                console.log("findNote()", ko.utils.unwrapObservable(item));
                return item;
            }
        });
    }; //Note helper function

    //SIGNALR FUNCTIONS//////////////////////////////////////////////
    deploySignalR.client.updateAll = function (payload) {
        
        console.log(viewModel.obsCheckEdit());
        //Warning toast triggered if client is engaged in editing a row
        if (viewModel.obsCheckEdit() >= 1) {
            var msg = "You are currently editing a record. Changes have been made to other records. Please refresh your browser when you are finished.";
            var cont = "Changes have been made...";
            infoToast(msg, cont);
        }
        else if (viewModel.obsCheckEdit() == 0) {
            viewModel.updateViewModel(payload);
            viewModel.resortList = ko.computed(function () {
                viewModel.queuedDeploys();
                return viewModel.queuedDeploys().sort(function (l, r) { return (l.depPlannedDateTime() < r.depPlannedDateTime() ? 1 : -1) });
            });
            console.log('Viewmodel updated');
        }
    } // Update all function, to be triggered when new batch of deploys are created
    deploySignalR.client.updateComments = function (payload) {
        viewModel.updateViewModelComment(payload);
    }
    deploySignalR.client.updateDeploy = function (id, key, value) {
        //console.log("id", id);
        //console.log("key", key);
        //console.log("value", value);
        var deploy = findDeploy(id);
        deploy[key](value);
        //console.log("updateDeploy()", deploy[key](value));

    } // updateDeploy function, to be triggered through SignalR
    deploySignalR.client.removeDeploy = function (id) {
        var record = findDeploy(id);
        viewModel.removeDeploy(record);
    }
    deploySignalR.client.updatePatchedNote = function (id, key, value) {
        var note = findNote(id);
        note[key](value);
        console.log("Updated an edited note");
    }
    deploySignalR.client.updateNewNote = function (payload) {
        console.log("Receieved new note");
        viewModel.updateViewModelNote(payload);
    }
    deploySignalR.client.browserNotification = function (type, message, icon) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var options = {
                body: message,
                icon: icon,
                color: "#000000"
            };
            var notification = new Notification(type, options);
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
        }

        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    } //Fires when triggered from other client

    //CONNECTION FUNCTIONS/////////////////////////////////////////
    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel, document.getElementById("BodyContent"));
        console.log("Connected to SignalR hub");

    }); // Connection (to SignalR hub) start function
    $.connection.hub.disconnected = function (deploy) {
        if (deploy != null) {

            //This calls the server-side 'Unlock' method that unlocks the row
            deploySignalR.server.unlock(deploy.depID);
        }
    } // Disconnecting from SignalR hub


});
//Evaluates the current smoke status of the record, and enables/disabled based off its value
function evalSmoke(divID, value) {
    console.log("evalSmoke(divID) = ", divID);
    console.log("evalSmoke(value) = ", value);
    if (value != "Not Ready") {
        divID.disabled = true;
    }
    else {
        divID.disabled = false;
    }
}

//Open when someone selects a record
function openNav() {
    
    $("#DetailsView").modal("show");
}
//Updates the paginate function (work in progress)
function updateCurrentPaginate() {

    $('#CurrentDeploysTable').after('<div id="nav"></div>');
    var rowsShown = 4;
    var rowsTotal = $('#CurrentDeploysTable tbody tr').length;
    var numPages = rowsTotal / rowsShown;
    for (i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#nav').append('<a href="#" rel="' + i + '">' + pageNum + '</a> ');
    }
    $('#CurrentDeploysTable tbody tr').hide();
    $('#CurrentDeploysTable tbody tr').slice(0, rowsShown).show();
    $('#nav a:first').addClass('active');
    $('#nav a').bind('click', function () {

        $('#nav a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $('#CurrentDeploysTable tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).
            css('display', 'table-row').animate({ opacity: 1 }, 300);
    });
};

//Checks changed values for browser notification
function checkForNotification(value, feature, version, signalR) {
    deploySignalR = signalR;
    var complete = '/images/static_pass.jpg';
    var fail = '/images/static_fail.jpg';
    var ready = '/images/static_loading.jpg';
    //Icon assignment
    if (value == 'Completed') {
        icon = complete;
    }
    else if (value == 'Failed') {
        icon = fail;
    }
    else {
        icon = ready;
    }
    var message = "User has updated " + feature + " " + version + " to " + value;
    deploySignalR.server.notification("Status", message, icon);
};

//Checks the value of a status field
function checkStatus() {
    var ctl = document.getElementById("ctlmodalStatus");
    var cmtBody = document.getElementById("commentBody");
    //console.log("Check status");
    if (ctl.value == 4) {
        $("#commentBody").fadeIn('slow');
        console.log("Set to fail");
    }
    else if (ctl.value == 3) {
        $("#smoke-div").fadeIn();
        $("#commentBody").fadeOut();
    }
    else {
        $("#commentBody").fadeOut();
    }
}

function checkSelID() {
    console.log(selID);
}
//Shows comment field and buttons in record details modal
function newComment() {
    
    $("#comment-button-div-1").fadeOut("fast");
    $("#comment-button-div-2").fadeIn("fast");
    $("#record-comment-text-field").fadeIn("fast");
}
//Hides comment field and buttons in record details modal
function cancelComment() {
    
    $("#comment-button-div-1").fadeIn("fast");
    $("#comment-button-div-2").fadeOut("fast");
    $("#recordCommentField").val("");
    $("#record-comment-text-field").fadeOut("fast");
    
}
//NOTE: The save comment function is located inside the viewmodel as submitComment


//Hides/shows the Smoke Queue div
function toggleSmokeWindow() {

    if (smokeWindow.style.display === "none") {
        $("#smokeWindow").fadeIn("fast");
        smokeState = 1;
        toggleSmokeButton();
        console.log(smokeState);
    }
    else {
        $("#smokeWindow").fadeOut("fast");
        smokeState = 0;
        toggleSmokeButton();
        console.log(smokeState);
    }
}
//Toggles the smoke window button
function toggleSmokeButton() {
    if (smokeState == 0) {
        smokeButton.className = "fa fa-angle-left";
    }
    else {
        smokeButton.className = "fa fa-angle-right";
    }
}

//Fires when record details modal is closed
$("#DetailsView").on("hidden.bs.modal", function () {
    cancelComment();
});

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}



//Form field references
var feature = document.getElementById("txtFeature");
var version = document.getElementById("txtVersion");
var environment = document.getElementById("txtEnvironment");
var plannedDate = document.getElementById("txtPlannedDate");
var plannedTime = document.getElementById("txtPlannedTime");
var firstPage = document.getElementById("clPage1");
var secondPage = document.getElementById("clPage2");
var firstFooter = document.getElementById("clFooter1");
var secondFooter = document.getElementById("clFooter2");
var thirdFooter = document.getElementById("clFooter3");


//Deploy template
var DeployModel = function (feaID, envID, statusID, smokeID, noteID, depVersion, depPlannedDateTime, Edit) {
    this.feaID = ko.observable(feaID);
    this.envID = ko.observable(envID);
    this.statusID = statusID;
    this.smokeID = smokeID;
    this.noteID = ko.observable(noteID);
    this.depVersion = ko.observable(depVersion);
    this.depPlannedDateTime = ko.observable(depPlannedDateTime);
    this.Edit = ko.observable(Edit);
};
//Deploy viewmodel
var TempDeployViewModel = function (signalR) {

    var self = this;
    self.testObservable = ko.observableArray();
    //Loading variables
    var loadingVar = 0;
    var loadingVarMax = 3;
    self.loading = ko.observable(true);
    self.loadingBody = ko.observable(false);
    //Deploys array
    self.deploys = ko.observableArray(0);
    self.featureList = ko.observableArray();
    self.environmentList = ko.observableArray();
    self.notes = ko.observableArray();
    self.tempTime = ko.observable(new Date());
    console.log("The temp time is: ", self.tempTime);

    //Observables for selected deploy
    self.selectedDeploy = ko.observableArray();
    self.selectedType = ko.observable();
    self.selectedIndex = ko.observable();

    //Observables for the NEW deploy fields
    self.feature = ko.observable();
    self.version = ko.observable();
    self.environment = ko.observable();
    
    self.plannedDateTime = ko.observable(new Date());

    //Observables for MASTER note
    self.selectedCL = ko.observableArray(self.notes()[0]);
    self.masterCL = ko.observableArray();
    self.mnBody = ko.observable();
    self.mnDateTime = ko.observable();

    //Observable for when enabling edit of a note
    self.noteBeingEdited = ko.observableArray([{
        id: null,
        body: ko.observable(0)
    }]);

    //Note update function
    self.updateNotesVM = function (payload) {
        console.log("payload: ", payload);
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(jvsObject.noteID, jvsObject.noteDateTime, jvsObject.noteVisID );
        self.notes.push(newNote);
        self.watchModel(newNote, self.modelChanged);
        console.log("Updated notes to viewmodel");
    };

    //Computed observables(to split up datetime field)
    self.computedDate = ko.computed({
        write: function (val) {
            self.plannedDateTime(moment(val, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm'))
        },
        read: function () {
            return moment(self.plannedDateTime()).format('YYYY-MM-DD');
        }
    });
    self.computedTime = ko.computed({
        write: function (val) {
            self.plannedDateTime(moment(val, 'HH:mm').format('YYYY-MM-DDTHH:mm'))
        },
        read: function () {
            return moment(self.plannedDateTime()).format('HH:mm');
        }
    });

    //Computed function to enable save after edit
    self.enableEditSave = ko.observable(false);

    //Function to determine the display mode of the table
    self.displayMode = function (deploys) {
        
        if (self.deploys().length == 0) {
            console.log("Empty template");
            return 'empty-template';
        }
        else if (deploys.Edit()) {
            
            return 'edit-template';
        }
        else if (deploys.Edit(false)) {
            
            return 'read-template';
        }

    };

    //Add new record to temp table function
    self.add = function () {

        var newRecord = [{

            feaID: self.feature(),
            envID: self.environment(),
            statusID: 1,
            smokeID: 1,
            noteID: self.masterCL().noteID,
            depVersion: self.version(),
            depPlannedDateTime: moment(self.plannedDateTime()).format(),
            Edit: false

        }];

        if (feature.value.length == 0 || version.value.length == 0 || environment.value.length == 0 || plannedDate.value.length == 0 || plannedTime.value.length == 0) {
            errorToast('You must enter ALL fields');

        }
        else {
            var newDeploy = ko.utils.arrayMap(newRecord, function (data) {
                return new DeployModel(data.feaID, data.envID, data.statusID, data.smokeID, data.noteID, data.depVersion, data.depPlannedDateTime, data.Edit)
            });

            //Push the new record to the temp table
            self.deploys.push.apply(self.deploys, newDeploy);
            
            console.log(ko.toJS(self.deploys));

        }
        
        //Empty the observables
        self.feature('');
        self.version('');
        self.environment('');
        

    };
    self.submit = function () {

        try {
            var jsonString = ko.mapping.toJSON(self.deploys);
            var obj = JSON.parse(jsonString);

            if (jsonString == null) {
                errorToast("You must enter at least one entry");
                return;
            }

            for (var item in obj) {
                if (obj.hasOwnProperty(item)) {
                    //aJax POST request
                    $.ajax({
                        url: "/api/DeployAPI",
                        type: "POST",
                        async: true,
                        mimeType: "text/html",
                        data: JSON.stringify(obj[item]),
                        contentType: "application/json",
                        dataType: "json",
                        success: function (data) {
                            console.log(data);
                            //Convert data to JSON for passing parameters
                            var response = ko.toJSON(data);
                            //Call the signalR hub to update all clients
                            signalR.server.updateAll(response);
                            successToast("Deploys have been successfully submitted.");
                        },
                        error: function (msg) {
                            console.log("error: ", msg.status);
                        }
                    });
                }
            }
            var overlay = document.getElementById("submitOverlay");
            overlay.style.width = "100%";
            
            setTimeout(redirect, 3000);

        }
        catch (err) {
            errorToast(err);
            console.log(err);
        }

        //Initialize variables for notifications
        var icon = '/images/static_bulb.jpg';
        var message = "A new batch of deploys has been submitted to the queue.";
        signalR.server.notification("Batch", message, icon);

    };
    self.edit = function (deploys) {
        deploys.Edit(true);
        deploys.depPlannedDateTime(new Date(deploys.depPlannedDateTime()));
    };
    self.remove = function (deploy) {
        self.deploys.remove(deploy);
    };
    self.done = function (deploys) {
        deploys.Edit(false);
        deploys.depPlannedDateTime(moment(deploys.depPlannedDateTime()).format());
        console.log('done');
        console.log("Updated deploy: ", ko.toJS(self.deploys));
    };

    //Remove CL from deploy in table
    self.removeCL = function (deploy) {
        deploy.noteID(undefined);
    };

    //Change Log modal functions
    self.changeLogBody = ko.observableArray([{
        id: null,
        body: ko.observable(0)
    }]);
    self.openCLModal = function () {
        
        var modal = document.getElementById("clModal");
        modal.style.display = "block";
        self.directToFirstPage();

        window.onclick = function (event) {
            if (event.target == modal) {
                self.closeCLModal();
            }
        }
    }
    self.closeCLModal = function () {
        $("#clModal").fadeOut("fast");
        self.directToFirstPage();
        
    }
    self.cancelCL = function () {
        console.log("Close");
        self.noteBeingEdited(0);
        self.enableEditSave(false);
        self.directToFirstPage();
    }
    self.newCL = function () {
        var selector = '#clTextEditor1';
        self.noteBeingEdited(new NoteBody(-1, '', ''));
        initNoteTextEditor(self, selector);
        self.enableEditSave(false);
        self.directToSecondPage();
    }
    self.submitCL = function () {
        var textBody = tinymce.activeEditor.getContent({ format: 'html' });
        if (textBody.length <= 0) {
            alert("You cannot enter an empty changelog");
            return;
        }
        //Get latest VisID
        if (self.notes().length > 0) {
            var maxObj = ko.utils.arrayFirst(self.notes(), function (cl) {
                return cl.noteVisID === Math.max.apply(null, ko.utils.arrayMap(self.notes(), function (e) {
                    return ko.toJS(e.noteVisID);
                }));
            });
        }
        else {
            console.log("changeLogs Array is null");
            var maxObj = [];
            maxObj["noteVisID"] = 0;
        }

        var visID = maxObj.noteVisID;
        visID++;
        console.log("New visID: ", visID);

        var newNote = new NewNote(dateForTimezone(new Date()), visID);
        postNote(signalR, newNote, textBody);
        
        self.directToFirstPage();
    }
    self.selectCL = function (data) {
        
        if (self.selectedCL().noteID == data.noteID) {
            self.loadingBody(false);
            return;
        }
        else {
            self.loadingBody(true);
            self.selectedCL(data);
            $.ajax({
                url: '/odata/Notes(' + data.noteID + ')/NoteBody',
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json',
                async: true,
                success: function (response) {
                    var value = response.value;
                    var clID = value[0].id;
                    var clBody = value[0].body;
                    //console.log("response body: ", clBody);
                    self.changeLogBody(new NoteBody(clID, clBody));
                    console.log("self.changeLogBody(): ", self.changeLogBody);
                },
                fail: function (err) {
                    console.log(err);
                },
                complete: function () {
                    self.loadingBody(false);
                }
            })

        }
    }
    self.removeSelection = function () {
        self.masterCL('undefined');
    }
    
    self.editCL = function () {
        var selector = '#clTextEditor1';
        //var content = ko.unwrap(self.selectedCL().noteBody);
        self.noteBeingEdited(new NoteBody(
            ko.unwrap(self.changeLogBody().id),
            ko.unwrap(self.changeLogBody().body)));
        console.log("noteBeingEdited: ", self.noteBeingEdited());
        initNoteTextEditor(self, selector);
        self.enableEditSave(false);
        self.directToEditPage();
    }
    self.refreshEditCL = function () {
        var content = tinymce.activeEditor.getContent({ format: 'html' });
        self.noteBeingEdited().body(content);
        
    }
    self.saveEditCL = function () {
        var payload = {};
        payload["id"] = ko.unwrap(self.noteBeingEdited().id);
        payload["body"] = ko.unwrap(self.noteBeingEdited().body);
        patchNote(payload, self.noteBeingEdited());
        self.noteBeingEdited(0);
        self.directToFirstPage();
        
    }
    self.directToFirstPage = function () {
        
        firstPage.style.display = "block";
        secondPage.style.display = "none";
        firstFooter.style.display = "block";
        secondFooter.style.display = "none";
        thirdFooter.style.display = "none";

    }
    self.directToSecondPage = function () {
       
        firstPage.style.display = "none";
        secondPage.style.display = "block";
        firstFooter.style.display = "none";
        secondFooter.style.display = "block";
        thirdFooter.style.display = "none";
    }
    self.directToEditPage = function () {

        firstPage.style.display = "none";
        secondPage.style.display = "block";
        firstFooter.style.display = "none";
        secondFooter.style.display = "none";
        thirdFooter.style.display = "block";

    };

    //Master open modal function for grabbing parameters
    self.openModalAndEval = function (data, type, index) {
        
        self.selectedDeploy(data);
        self.selectedType(type);
        self.selectedIndex(index);
        console.log('self.selectedDeploy: ', ko.unwrap(self.selectedDeploy), 'self.selectedType: ', self.selectedType, 'self.selectedIndex: ', self.selectedIndex);
        
        var id = ko.unwrap(data.noteID);
        console.log('noteID: ', id);
        
        if (id !== undefined) {
            self.selectCL(self.findNote(id));
        };
        
        self.openCLModal();
    }

    //Master close modal function for evaluating whether its a MASTER change log selection, or an EDIT change log selection
    self.closeModalAndEval = function () {
        var evalType = ko.unwrap(self.selectedType);
        var evalIndex = ko.unwrap(self.selectedIndex);
        
        if (self.selectedCL() == '') {
            errorToast("You must select a change log to continue.");
            return;
        }
        else if (evalType == 'edit') {
            self.deploys()[evalIndex].noteID(self.selectedCL().noteID);
            self.closeCLModal();
        }
        else {
            
            self.masterCL(ko.utils.unwrapObservable(self.selectedCL()));
            console.log("self.masterCL: ", self.masterCL());
            console.log("textContent: ", masterNoteText.textContent);
            self.closeCLModal();
        }
    }

    //Computed functions
    self.sortedChangeLogs = ko.computed(function () {
        var CLList = self.notes();
        return CLList.sort(function (l, r) {
            return (l.noteVisID < r.noteVisID ? 1 : -1);
        });
    });
    self.findNote = function (id) {
        return ko.utils.arrayFirst(self.notes(), function (item) {
            if (item.noteID == id) {
                console.log("findNote()", ko.utils.unwrapObservable(item));
                return item;
            }
        });
    }

    //Checks to make sure properties are observable
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key]) && key != 'Edit') {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                });
            }
        }
    }
    //Subscribes to observable objects, and listens for changes
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            callback(key, val);
        });
    }

    //Finder functions
    self.featureFromID = function (id) {
        return ko.utils.arrayFirst(self.featureList(), function (item) {
            if (item.feaID == id) {
                //console.log("feaName: ", ko.unwrap(item.feaName));
                return ko.unwrap(item.feaName);
            }
        })
    };
    self.environmentFromID = function (id) {
        return ko.utils.arrayFirst(self.environmentList(), function (item) {
            if (item.envID == id) {
                //console.log("envName: ", ko.unwrap(item.envName));
                return ko.unwrap(item.envName);
            }
        })
    };
    self.noteFromID = function (id) {
        return ko.utils.arrayFirst(self.notes(), function (item) {
            if (item.noteID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.noteVisID);
            }
        })
    };

    //Fetching data from tables
    $.getJSON('/odata/Features', function (data) {
        self.featureList(ko.utils.arrayMap(data.value, function (featureList) {
            var obsFeature = {
                feaID: featureList.feaID,
                feaName: ko.observable(featureList.feaName)
            }

            return obsFeature;
        }));
    })
        .done(function () {
            loadingVar++;
            if (loadingVar == loadingVarMax) {
                self.loading(false);
            }
            else {
                return;
            }
        });
    $.getJSON('/odata/Environments', function (data) {
        self.environmentList(ko.utils.arrayMap(data.value, function (environmentList) {
            var obsEnvironment = {
                envID: environmentList.envID,
                envName: ko.observable(environmentList.envName)
            }

            return obsEnvironment;
        }));
    })
        .done(function () {
            loadingVar++;
            if (loadingVar == loadingVarMax) {
                self.loading(false);
            }
            else {
                return;
            }
        });
    $.getJSON('/odata/Notes', function (data) {
        self.notes(ko.utils.arrayMap(data.value, function (notes) {
            var obsNote = {
                noteID: notes.noteID,
                noteVisID: notes.noteVisID,
                noteDateTime: ko.observable(notes.noteDateTime)
            }

            return obsNote;
        }));
    })
        .done(function () {
            loadingVar++;
            if (loadingVar == loadingVarMax) {
                self.loading(false);
            }
            else {
                return;
            }
        });
}
$(function () {
    $("#txtPlannedDate").datepicker();
    $("#ctlPlannedDate").datepicker();
    var signalR = $.connection.deploy;
    var viewModel = new TempDeployViewModel(signalR);
    
    signalR.client.updateNewNote = function (payload) {
        viewModel.updateNotesVM(payload);
    }
    signalR.client.updatePatchedNote = function (id, key, value) {

        var note = findNote(id, viewModel.notes());
        note[key](value);
        console.log("updatePatchedNote(): ", note[key](value));
    };
    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel, document.getElementById("BodyContent"));
        console.log('Connected to signalR hub...');

    });
});



//Converts HTML to regular text
function stripHTML(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}

var DeleteKey = function (array, key) {
    this.array = array;
    this.key = key;
    var newarray = delete array.key;

    return newarray;

}

function redirect() {
    var url = $("#Redirect").val();
    location.href = url;
}

ko.bindingHandlers['wysiwyg'].defaults = {
    
};

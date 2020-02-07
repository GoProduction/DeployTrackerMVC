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
var Deploy = function (depFeature, depVersion, depEnvironment, depPlannedDateTime, depStatus, depSmoke, noteID, Edit) {
    this.depFeature = ko.observable(depFeature);
    this.depVersion = ko.observable(depVersion);
    this.depPlannedDateTime = ko.observable(depPlannedDateTime);
    this.depStatus = ko.observable(depStatus);
    this.depSmoke = ko.observable(depSmoke);
    this.depEnvironment = ko.observable(depEnvironment);
    this.noteID = ko.observable(noteID);
    this.Edit = ko.observable(Edit);
};
//Deploy viewmodel
var TempDeployViewModel = function (signalR) {

    var self = this;

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
        noteID: null,
        noteBody: ko.observable(0),
        noteDateTime: ko.observable(0)
    }]);

    //Note update function
    self.updateNotesVM = function (payload) {
        console.log("payload: ", payload);
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(jvsObject.noteID, jvsObject.noteBody, jvsObject.noteDateTime, jvsObject.noteVisID);
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

            depFeature: self.feature(),
            depVersion: self.version(),
            depPlannedDateTime: moment(self.plannedDateTime()).format(),
            depStatus: 'Queued',
            depSmoke: "Not Ready",
            depEnvironment: self.environment(),
            noteID: self.masterCL().noteID,
            Edit: false

        }];

        if (feature.value.length == 0 || version.value.length == 0 || environment.value.length == 0 || plannedDate.value.length == 0 || plannedTime.value.length == 0) {
            errorToast('You must enter ALL fields');

        }
        else {
            var newDeploy = ko.utils.arrayMap(newRecord, function (data) {
                return new Deploy(data.depFeature, data.depVersion, data.depEnvironment, data.depPlannedDateTime, data.depStatus, data.depSmoke, data.noteID, data.Edit)
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
        self.noteBeingEdited(new Note(-1, '', '', ''));
        initTextEditor(self);
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

        var newNote = new NewNote(ko.unwrap(self.noteBeingEdited().noteBody), dateForTimezone(new Date()), visID);
        postNote(signalR, newNote);
        
        self.directToFirstPage();
    }
    self.selectCL = function (data) {
        self.selectedCL(data);
        console.log("Selected CL", self.selectedCL().noteID);
        //var noteBody = ko.unwrap(self.selectedCL().noteBody);
        //var preview = document.getElementById("clPreview");
        //$("#clPreview").html(noteBody);

        $(".rowSelect").focus();

    }
    self.removeSelection = function () {
        self.masterCL('undefined');
    }
    
    self.editCL = function () {
        
        //var content = ko.unwrap(self.selectedCL().noteBody);
        self.noteBeingEdited(new Note(
            self.selectedCL().noteID,
            ko.unwrap(self.selectedCL().noteBody),
            ko.unwrap(self.selectedCL().noteDateTime)
        ));
        initTextEditor(self);
        self.enableEditSave(false);
        self.directToEditPage();
    }
    self.refreshEditCL = function () {
        var content = tinymce.activeEditor.getContent({ format: 'html' });
        self.noteBeingEdited().noteBody(content);
        
    }
    self.saveEditCL = function () {
        var payload = {};
        payload["noteBody"] = ko.utils.unwrapObservable(self.noteBeingEdited().noteBody);
        patchNote(payload, self.selectedCL());
        var updatedNote = ko.unwrap(self.noteBeingEdited());
        var noteID = ko.utils.unwrapObservable(updatedNote.noteID);
        var noteBody = ko.utils.unwrapObservable(updatedNote.noteBody);
        var noteDateTime = ko.utils.unwrapObservable(updatedNote.noteDateTime);

        self.selectedCL().noteID = noteID;
        self.selectedCL().noteBody(noteBody);
        self.selectedCL().noteDateTime(noteDateTime);

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

    //Fetching data from tblFeature
    $.getJSON('/odata/Features', function (data) {
        self.featureList(ko.utils.arrayMap(data.value, function (featureList) {
            var obsFeature = {
                feaID: featureList.feaID,
                feaName: ko.observable(featureList.feaName)
            }

            return obsFeature;
        }));
    });
    //Fetching data from tblEnvironment
    $.getJSON('/odata/Environments', function (data) {
        self.environmentList(ko.utils.arrayMap(data.value, function (environmentList) {
            var obsEnvironment = {
                envID: environmentList.envID,
                envName: ko.observable(environmentList.envName)
            }

            return obsEnvironment;
        }));
    });
    //Fetching data from tblNotes
    $.getJSON('/odata/Notes', function (data) {
        self.notes(ko.utils.arrayMap(data.value, function (notes) {
            var obsNote = {
                noteID: notes.noteID,
                noteVisID: notes.noteVisID,
                noteBody: ko.observable(notes.noteBody),
                noteDateTime: ko.observable(notes.noteDateTime)
            }

            return obsNote;
        }));
    });
}
$(function () {
    $("#txtPlannedDate").datepicker();
    $("#ctlPlannedDate").datepicker();
    var signalR = $.connection.deploy;
    var viewModel = new TempDeployViewModel(signalR);
    
    signalR.client.updateNotes = function (payload) {
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

function initTextEditor(viewModel) {
   
    tinymce.init({
        selector: '#clTextEditor1',
        height: 500,
        
        plugins: ['link'],
        toolbar: 'undo redo | bold italic | bullist numlist | link',
        menubar: false,
        statusbar: false,
        init_instance_callback: function (editor) {
            console.log("Editor: " + editor.id + " is now initialized.");
            editor.on('input', function () {
                viewModel.refreshEditCL();
                viewModel.enableEditSave(true);
            })
        }
    });
}

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

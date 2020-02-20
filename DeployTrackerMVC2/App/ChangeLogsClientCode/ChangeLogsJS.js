var CLViewModel = function (signalR) {
    var self = this;
    //Observable arrays
    self.changeLogs = ko.observableArray();
    self.selectedCL = ko.observableArray(self.changeLogs()[0]);
    self.editorCL = ko.observableArray([{
        noteID: null,
        noteBody: ko.observable(0),
        noteDateTime: ko.observable(0)
    }]);

    //Fetch data
    $.getJSON('/odata/Notes', function (data) {
        self.changeLogs(ko.utils.arrayMap(data.value, function (changeLogs) {
            var obsChangeLog = {
                noteID: changeLogs.noteID,
                noteBody: ko.observable(changeLogs.noteBody),
                noteDateTime: ko.observable(changeLogs.noteDateTime),
                noteVisID: changeLogs.noteVisID
            }
            return obsChangeLog;
        }))
    });

    //Update Function
    self.updateViewModel = function (payload) {
        console.log("payload: ", payload);
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(jvsObject.noteID, jvsObject.noteBody, jvsObject.noteDateTime, jvsObject.noteVisID);
        self.changeLogs.push(newNote);
        self.watchModel(newNote, self.modelChanged);
        console.log("Updated viewmodel");
    };

    //Subscription Functions
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            console.log("self.subscribeToProperty");
            callback(key, val);
        });
    };
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
    self.modelChanged = function (model, key, val) {
        var payload = {};
        payload[key] = val;
        console.log("self.modelChanged()", payload);
    };

    //Regular Functions
    self.select = function (data) {
        self.selectedCL(data);
        
    }
    self.newChangeLog = function () {
        self.clearEditor();
        self.enableEditSave(false);
        initTextEditor(self);
        self.directToSecondPage();
    }
    self.edit = function () {
        self.editorCL(new Note(
            self.selectedCL().noteID,
            ko.unwrap(self.selectedCL().noteBody),
            ko.unwrap(self.selectedCL().noteDateTime,
            self.selectedCL().noteVisID)
        ));
        self.enableEditSave(false);
        initTextEditor(self);
        self.directToEditPage();
        
    }
    self.saveEditCL = function () {
        var payload = {};
        payload["noteBody"] = ko.utils.unwrapObservable(self.editorCL().noteBody);
        patchNote(payload, self.selectedCL());

        var updatedNote = ko.unwrap(self.editorCL());
        var noteID = ko.utils.unwrapObservable(updatedNote.noteID);
        var noteBody = ko.utils.unwrapObservable(updatedNote.noteBody);
        var noteDateTime = ko.utils.unwrapObservable(updatedNote.noteDateTime);

        self.selectedCL().noteID = noteID;
        self.selectedCL().noteBody(noteBody);
        self.selectedCL().noteDateTime(noteDateTime);

        self.clearEditor();
        self.directToFirstPage();

    }
    self.cancel = function () {
        
        if (self.enableEditSave() == true) {
            var alert = confirm("This will cancel your note submission. Are you sure you want to continue?");
            if (alert == true) {
                self.clearEditor();
                self.directToFirstPage();
            }
            else {
                return null;
            }
        }
        self.clearEditor();
        self.directToFirstPage();
    };
    self.submitCL = function () {
        var textBody = tinymce.activeEditor.getContent({ format: 'html' });
        if (textBody == '') {
            alert("You cannot enter an empty note.");
            return;
        }

        //Get latest VisID
        if (self.changeLogs().length > 0) {
            var maxObj = ko.utils.arrayFirst(self.changeLogs(), function (cl) {
                return cl.noteVisID === Math.max.apply(null, ko.utils.arrayMap(self.changeLogs(), function (e) {
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
        var newNote = new NewNote(textBody, dateForTimezone(new Date()), visID);
        postNote(signalR, newNote);
        self.clearEditor();
        self.directToFirstPage();
    }
    self.clearEditor = function () {
        self.editorCL(new Note(-1, '', ''));
            
    }

    //Refresh edit cl function
    self.refreshEditCL = function () {
        var content = tinymce.activeEditor.getContent({ format: 'html' });
        self.editorCL().noteBody(content);

    }
    //Observable used to enable the save button
    self.enableEditSave = ko.observable(false);

    //Page directions
    self.directToFirstPage = function () {
        $("#secondPage").fadeOut("fast");
        $("#secondFooter").fadeOut("fast");
        $("#editFooter").fadeOut("fast");
        $("#firstPage").fadeIn("fast");
        $("#firstFooter").fadeIn("fast");
    }
    self.directToSecondPage = function () {
        $("#firstPage").fadeOut("fast");
        $("#firstFooter").fadeOut("fast");
        $("#editFooter").fadeOut("fast");
        $("#secondPage").fadeIn("fast");
        $("#secondFooter").fadeIn("fast");
    }
    self.directToEditPage = function () {
        $("#firstPage").fadeOut("fast");
        $("#firstFooter").fadeOut("fast");
        $("#secondFooter").fadeOut("fast");
        $("#secondPage").fadeIn("fast");
        $("#editFooter").fadeIn("fast");
    }

    //Computed Functions
    self.sortedChangeLogs = ko.computed(function () {
        var CLList = self.changeLogs();
        return CLList.sort(function (l, r) {
            return (l.noteVisID < r.noteVisID ? 1 : -1);
        });
    });
}

$(function () {
    var signalR = $.connection.deploy;
    var viewModel = new CLViewModel(signalR);

    var secondPage = document.getElementById("secondPage");
    var secondFooter = document.getElementById("secondFooter");
    var editFooter = document.getElementById("editFooter");

    signalR.client.updateNewNote = function (payload) {
        viewModel.updateViewModel(payload);
    }
    signalR.client.updatePatchedNote = function (id, key, value) {
        
        var note = findNote(id, viewModel.changeLogs());
        note[key](value);
        console.log("updatePatchedNote(): ", note[key](value));
    }

    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel, document.getElementById("bodyContent"));
        console.log("Conected to SignalR server...");
        secondPage.style.display = "none";
        secondFooter.style.display = "none";
        editFooter.style.display = "none";

    });

});
function initTextEditor(viewModel) {

    tinymce.init({
        selector: '#textEditor',
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
$(document).ready(function () {
    $("#loadingDiv").fadeOut();
});
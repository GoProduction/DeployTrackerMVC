var CLViewModel = function (signalR) {
    var self = this;
    //Loading observable for note body window and page
    self.loadingBody = ko.observable(false);
    self.loadingPage = ko.observable(true);

    //Loading text var
    var loadingText = document.getElementById("loadingText");

    //Observable arrays
    self.changeLogs = ko.observableArray();
    self.selectedCL = ko.observableArray(self.changeLogs()[0]);
    self.editorCL = ko.observableArray([{
        id: null,
        body: ko.observable()
    }]);

    //Change log body observable
    self.changeLogBody = ko.observableArray([{
        id: null,
        body: ko.observable(0)
    }]);

    //Fetch data
    $.getJSON('/odata/Notes', function (data) {
        loadingText.innerText = "Loading notes..."
        self.changeLogs(ko.utils.arrayMap(data.value, function (changeLogs) {
            var obsChangeLog = {
                noteID: changeLogs.noteID,
                noteDateTime: ko.observable(changeLogs.noteDateTime),
                noteVisID: changeLogs.noteVisID
            }
            return obsChangeLog;
        }))
    })
        .done(function () {
            console.log("Finished loading");
            self.loadingPage(false);
        });
        

    //Update Function
    self.updateViewModel = function (payload) {
        console.log("payload: ", payload);
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(jvsObject.noteID, jvsObject.noteDateTime, jvsObject.noteVisID);
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
        
        if (self.selectedCL().noteID == data.noteID) {
            self.loadingBody(false);
            content.style.display = 'block';
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
       
        $("#paneLoadingDiv").fadeOut('fast');
    }
    self.newChangeLog = function () {
        var selector = '#textEditor';
        self.clearEditor();
        self.enableEditSave(false);
        initNoteTextEditor(self, selector);
        self.directToSecondPage();
    }
    self.edit = function () {
        var selector = '#textEditor';
        console.log('edit');
        self.enableEditSave(false);
        self.editorCL(new NoteBody(
            ko.unwrap(self.changeLogBody().id),
            ko.unwrap(self.changeLogBody().body)
        ));
        initNoteTextEditor(self, selector);
        self.directToEditPage();
        
    }
    self.saveEditCL = function () {
        var payload = {};
        payload["body"] = ko.utils.unwrapObservable(self.editorCL().body);
        patchNote(payload, self.changeLogBody());

        self.changeLogBody().body(ko.unwrap(self.editorCL().body));

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
        var newNote = new NewNote(dateForTimezone(new Date()), visID);
        postNote(signalR, newNote, textBody);

        self.clearEditor();
        self.directToFirstPage();
    }
    self.clearEditor = function () {
        self.editorCL(new NoteBody(-1, '', ''));
            
    }

    //Refresh edit cl function
    self.refreshEditCL = function () {
        var content = tinymce.activeEditor.getContent({ format: 'html' });
        self.editorCL().body(content);

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

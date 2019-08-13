function init() {
    ko.trackChange = function (observable, key) {

        var store = amplify.store.localStorage;

        //initialize from stored value, or if no value is stored yet, use the current value
        var value = store(key) || observable();

        //track the changes
        observable.subscribe(function (newValue) {
            store(key, newValue || null);

            if (ko.toJSON(observable()) != ko.toJSON(newValue)) {
                observable(newValue);
            }
        });

        observable(value); //restore current value
    };
    ko.persistChanges = function (vm, prefix) {
        if (prefix === undefined) {
            prefix = '';
        }

        for (var n in vm) {

            var observable = vm[n];
            var key = prefix + n;

            if (ko.isObservable(observable) && !ko.isComputed(observable)) {
                ko.trackChange(observable, key);

                //force load
                observable();
            }
        }
    };

    ko.isComputed = function (instance) {
        if ((instance === null) || (instance === undefined) || (instance.__ko_proto__ === undefined)) {
            return false;
        }

        if (instance.__ko_proto__ === ko.dependentObservable) {
            return true;
        }

        return ko.isComputed(instance.__ko_proto__); // Walk the prototype chain
    };
}
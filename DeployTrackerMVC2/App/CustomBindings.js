ko.bindingHandlers.dateFormatted = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.registerEventHandler(element, 'change', function () {
            var value = valueAccessor();

            if (element.value !== null && element.value !== undefined && element.value.length > 0) {
                value(element.value);
            } else {
                value('');
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var val = valueAccessor();

        var formatted = 'Invalid date';
        var date = moment(ko.utils.unwrapObservable(val));

        var format = allBindingsAccessor().format || 'YYYY-MM-DD';

        if (date && date.isValid()) {
            formatted = date.format(format);
        }
        else {
            formatted = "";
        }

        if ($(element).is('input') === true) {
            $(element).val(formatted);
        } else {
            $(element).text(formatted);
        }
    }
};

ko.bindingHandlers.timeFormatted = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.registerEventHandler(element, 'change', function () {
            var value = valueAccessor();

            if (element.value !== null && element.value !== undefined && element.value.length > 0) {
                value(new Date(element.value));
            } else {
                value('');
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var val = valueAccessor();

        var formatted = 'Invalid date';
        var time = moment(ko.utils.unwrapObservable(val));

        var format = allBindingsAccessor().format || 'HH:mm';

        if (time && time.isValid()) {
            formatted = time.format(format);
        }
        else {
            formatted = "";
        }

        if ($(element).is('input') === true) {
            $(element).val(formatted);
        } else {
            $(element).text(formatted);
        }
    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var $el = $(element);

        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $el.datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($el.datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.datepicker("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            $el = $(element),
            current = $el.datepicker("getDate");

        if (value - current !== 0) {
            $el.datepicker("setDate", value);
        }
    }
};

ko.bindingHandlers.timepickerInput = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        // Get the value of the value binding
        var value = valueAccessor();

        console.log('The value of the element should be here – ', value());
        // If the value is not a valid moment in time,
        console.log(!moment(value()).isValid());
        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            console.log('observable – ', observable());
            var tzdstOffset = (observable().getTimezoneOffset() + (moment(observable()).isDST() ? 60 : 0));
            var adjustedTime = new Date($(element)[0].valueAsDate.getTime() + (tzdstOffset * 60 * 1000));
            var adjustedDate = observable();
            adjustedDate.setHours(
                adjustedTime.getHours(),
                adjustedTime.getMinutes(),
                adjustedTime.getSeconds()
            );
            observable(adjustedDate);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var thisElement = $(element);
        console.log('Value updating to -', value);
        var thisMoment = new moment(value).format('HH:mm');
        //console.log(‘Value updating to -‘, thisMoment);
        console.log('This is the element – ', thisMoment);
        thisElement[0].value = thisMoment;
        console.log('This is the element – ', thisElement);
    }
}

ko.bindingHandlers.fullDateTime = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.registerEventHandler(element, 'change', function () {
            var value = valueAccessor();

            if (element.value !== null && element.value !== undefined && element.value.length > 0) {
                value(new Date(element.value));
            } else {
                value('');
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var val = valueAccessor();

        var formatted = 'Invalid date';
        var time = moment(ko.utils.unwrapObservable(val));

        var format = allBindingsAccessor().format || 'MMM Do YYYY h:mm a';

        if (time && time.isValid()) {
            formatted = time.format(format);
        }
        else {
            formatted = "";
        }

        if ($(element).is('input') === true) {
            $(element).val(formatted);
        } else {
            $(element).text(formatted);
        }
    }
};

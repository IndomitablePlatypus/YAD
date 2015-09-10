function isCallable(name) {
    return Object.prototype.toString.call(name) === '[object Function]';
}

function getUUID() {
    return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function () {
        var r = Math.random() * 16 | 0;
        return r.toString(16);
    });
}

function thereis(variable) {
    return typeof variable !== 'undefined';
}

function iselse(variable, value) {
    if (thereis(variable)) {
        return variable;
    }
    if (isCallable(value)) {
        return value();
    }
    return value;
}

function yell (event, data, closure) {
    return Y.AD.yell.call(Y.AD, event, data, closure);
};

function whisper (event, data, closure) {
    return Y.AD.whisper.call(Y.AD, event, data, closure);
};

Y = {
    AD: {
        _delay: 0,
        _eventListeners: [],
        _listeners: [],
        _createEvent: function (event, data, closure) {
            return new Y.AE(event, data, closure);
        },
        _isEventObject: function (event) {
            return event instanceof Y.AE;
        },
        _prepareEvent: function (event, data, closure) {
            if (this._isEventObject(event)) {
                event.setData(data);
                event.setClosure(closure);
                return event;
            } else {
                return this._createEvent(event, data, closure);
            }
        },
        _runListeners: function (listeners, event) {
            for (var property in listeners) {
                if (listeners.hasOwnProperty(property)) {
                    listeners[property].listener.call(listeners[property].context, event);
                }
            }
        },
        _dispatch: function (event) {
            var names = event.getNames();
            var els = this._eventListeners;
            for (var i = 0; i < names.length; i++) {
                if (els.hasOwnProperty(names[i])) {
                    els = els[names[i]];
                    if (thereis(els[0])) {
                        this._runListeners(els[0], event);
                    }
                }
            }
            event.done();
        },
        _say: function (event, data, closure, immediate) {
            if (!thereis(event)) {
                return undefined;
            }
            immediate = iselse(immediate, true);
            var e = this._prepareEvent(event, data, closure);
            if (immediate) {
                this._dispatch(e);
                return e.done();
            } else {
                setTimeout(function (e) {
                    this._dispatch(e);
                    return e.done();
                }.bind(this), this._delay, e);
            }
        },
        _addListener: function (event, listener, context) {
            var listenerName = listener.toString();
            this._listeners[listenerName] = listener;
            var names = event.getNames();
            var els = this._eventListeners;
            for (var i = 0; i < names.length; i++) {
                if (!els.hasOwnProperty(names[i])) {
                    els[names[i]] = [[]];
                }
                els = els[names[i]];
            }
            els[0][listenerName] = {listener: listener, context: context};
            return this;
        },
        _removeListener: function (listener) {
            var listenerName = listener.toString();
            if (thereis(this._listeners[listenerName])) {
                delete this._listeners[listenerName];
            }
            return this;
        },
        _removeEvent: function () {

        },
        _parseEventInfo: function (eventInfo) {
            var events = [];
            if (this._isEventObject(eventInfo)) {
                events.push(eventInfo);
            } else {
                var es = eventInfo.split(' ');
                for (var i = 0; i < es.length; i++) {
                    events.push(this._createEvent(es[i]));
                }
            }
            return events;
        },
        _parseListenerInfo: function (listenerInfo) {
            var listeners = [];
            if (!(listenerInfo instanceof Array)) {
                listenerInfo = [listenerInfo];
            } else {

            }
            for (var i = 0; i < listenerInfo.length; i++) {
                if (isCallable(listenerInfo[i])) {
                    listeners.push(listenerInfo[i]);
                }
            }
            return listeners;
        },
        listen: function (event, listener, context) {
            var events = this._parseEventInfo(event);
            var listeners = this._parseListenerInfo(listener);
            context = iselse(context, window);
            for (var i = 0; i < events.length; i++) {
                for (var j = 0; j < listeners.length; j++) {
                    this._addListener(events[i], listeners[j], context);
                }
            }
            return this;
        },
        unlistenListener: function (listener) {
            var listeners = this._parseListenerInfo(listener);
            for (var i = 0; i < listeners.length; i++) {
                this._removeListener(listeners[i]);
            }
            return this;
        },
        unlistenEvent: function (event) {
            var events = this._parseEventInfo(event);
            for (var i = 0; i < events.length; i++) {
                this._removeEvent(events[i]);
            }
            return this;
        },
        yell: function (event, data, closure) {
            return this._say(event, data, closure);
        },
        whisper: function (event, data, closure) {
            return this._say(event, data, closure, false);
        },
        init: function (delay) {
            this._delay = iselse(delay, 0);
            return this;
        }
    },
    AE: function (name, data, closure) {
        // "this" is YE, when calling new YAD.YE
        this._parse(name, data, closure);
    }
};

Y.AE.prototype = {
    _name: 'exclamation',
    _data: {},
    _names: ['exclamation'],
    _stop: false,
    _closure: undefined,
    _parse: function (name, data, closure) {
        this.setName(name)
                .setData(data)
                .setClosure(closure);
        return this;
    },
    setCarryOn: function (key, value) {
        this._data[key] = value;
        return this;
    },
    setName: function (name) {
        this._name = iselse(name, this._name);
        this._names = this._name.split('.');
//        var names = this._name.split('.');
//        this._names = [names[0]];
//        for(var i = 1; i < names.length; i++) {
//            this._names.push(this._names[i-1] + '.' + names[i]);
//        }
        return this;
    },
    setData: function (data) {
        this._data = iselse(data, this._data);
        return this;
    },
    setClosure: function (closure) {
        this._closure = closure;
        return this;
    },
    stopPropagation: function () {
        this.stop = true;
        return this;
    },
    isStopped: function () {
        return this.stop;
    },
    getName: function () {
        return this._name;
    },
    getNames: function () {
        return this._names;
    },
    getData: function () {
        return this._data;
    },
    getClosure: function () {
        return this._closure;
    },
    done: function () {
        if (thereis(this._closure)) {
            this._closure();
        }
        return this;
    }
};
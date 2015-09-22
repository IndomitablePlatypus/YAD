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

YAD = {
    _dispatcher: undefined,
    getDispatcher: function () {
        return thereis(this._dispatcher) ? this._dispatcher : this._dispatcher = new this.Dispatcher();
    },
    createEvent: function (name, data, closure) {
        return new this.Event(name, data, closure);
    },
    createListener: function (executor, context, name) {
        return new this.Listener(executor, context, name);
    },
    Dispatcher: function () {
        return this instanceof YAD.Dispatcher ? this : this.getDispatcher();
    },
    Event: function (name, data, closure) {
        // "this" is YE, when calling new YAD.Event
        this._parse(name, data, closure);
    },
    Listener: function (name, executor, context) {
        this._parse(name, executor, context);
    },
    yell: function (event, data, closure) {
        return this.getDispatcher().say(event, data, closure);
    },
    whisper: function (event, data, closure) {
        return this.getDispatcher().say(event, data, closure, false);
    },
    listen: function (event, listener, context) {
        return this.getDispatcher().listen(event, listener, context);
    }
};

YAD.Dispatcher.prototype = {
    _delay: 0,
    _dispatchMode: 0,
    _eventListeners: [],
    _listeners: [],
    _createEvent: function (event, data, closure) {
        return YAD.createEvent(event, data, closure);
    },
    _isEventObject: function (event) {
        return event instanceof YAD.Event;
    },
    _prepareEvents: function (event, data) {
        var events = [];
        if (this._isEventObject(event)) {
            event.setData(data);
            events.push(event);
        } else {
            var names = event.split('.');
            var name = names[0];
            events.push(this._createEvent(name, data));
            for (var i = 1; i < names.length; i++) {
                name = name + '.' + names[i];
                events.unshift(this._createEvent(name, data));
            }
        }
        return events;
    },
    _parseListenerInfo: function (listenerInfo, context) {
        if (listenerInfo instanceof YAD.Listener) {
            return listenerInfo;
        }
        if (Array.isArray(listenerInfo)) {
            return listenerInfo.length >= 2 ?
                    YAD.createListener(listenerInfo[0], listenerInfo[1]) :
                    YAD.createListener(listenerInfo[0], context);
        }
        return YAD.createListener(listenerInfo, context);
    },
    _prepareListeners: function (listenersInfo, context) {
        var listeners = [];
        if (!Array.isArray(listenersInfo)) {
            listeners.push(this._parseListenerInfo(listenersInfo, context));
            return listeners;
        }
        ;
        for (var i = 0; i < listenersInfo.length; i++) {
            listeners.push(this._parseListenerInfo(listenersInfo[i]), context);
        }
        return listeners;
    },
    _runListeners: function (listeners, event) {
        for (var property in listeners) {
            if (listeners.hasOwnProperty(property)) {
                listeners[property].invoke(event);
                if (event.isStopped()) {
                    break;
                }
            }
        }
        return this;
    },
    _dispatch: function (events) {
        var els = this._eventListeners;
        for (var i = 0; i < events.length; i++) {
            var name = events[i].getName();
            if (els.hasOwnProperty(name)) {
                this._runListeners(els[name], events[i]);
            }
        }
        return this;
    },
    _addListener: function (event, listener) {
        this._listeners[listener.getName()] = listener;
        if (!this._eventListeners.hasOwnProperty(event.getName())) {
            this._eventListeners[event.getName()] = [];
        }
        this._eventListeners[event.getName()][listener.getName()] = listener;
        return this;
    },
    _removeListener: function (listener) {
        if (thereis(this._listeners[listener.getName()])) {
            delete this._listeners[listener.getName()];
        }
        return this;
    },
    _removeEvent: function () {

    },
    say: function (event, data, closure, immediate) {
        if (!thereis(event)) {
            return undefined;
        }
        immediate = iselse(immediate, true);
        var events = this._prepareEvents(event, data);
        if (immediate) {
            this._dispatch(events);
        } else {
            setTimeout(function (events) {
                this._dispatch(events);
            }.bind(this), this._delay, events);
        }
        return thereis(closure) ? closure() : true;
    },
    listen: function (event, listener, context) {
        var events = this._prepareEvents(event);
        var listeners = this._prepareListeners(listener, context);
        for (var i = 0; i < events.length; i++) {
            for (var j = 0; j < listeners.length; j++) {
                this._addListener(events[i], listeners[j]);
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
    configure: function (delay, dispatchMode) {
        this._delay = iselse(delay, 0);
        this._dispatchMode = iselse(dispatchMode, 0);
        return this;
    }
};

YAD.Event.prototype = {
    _name: 'exclamation',
    _data: {},
    _stopped: false,
    _parse: function (name, data) {
        this.setName(name).setData(data);
        return this;
    },
    setCarryOn: function (key, value) {
        this._data[key] = value;
        return this;
    },
    setName: function (name) {
        this._name = iselse(name, this._name);
        return this;
    },
    setData: function (data) {
        this._data = iselse(data, this._data);
        return this;
    },
    stopPropagation: function () {
        this._stopped = true;
        return this;
    },
    stop: function () {
        return this.stopPropagation();
    },
    isStopped: function () {
        return this._stopped;
    },
    getName: function () {
        return this._name;
    },
    getData: function () {
        return this._data;
    }
};

YAD.Listener.prototype = {
    _name: undefined,
    _executor: undefined,
    _context: undefined,
    _parse: function (executor, context, name) {
        this.setExecutor(executor).setContext(context).setName(name);
        return this;
    },
    setName: function (name) {
        this._name = iselse(name, this._name);
        return this;
    },
    setExecutor: function (executor) {
        this._executor = executor;
        this._name = iselse(this._name, this._executor.toString());
        return this;
    },
    setContext: function (context) {
        this._context = iselse(context, window);
        return this;
    },
    getName: function () {
        return this._name;
    },
    getExecutor: function () {
        return this._executor;
    },
    getContext: function () {
        return this._context;
    },
    isViable: function () {
        return isCallable(this._executor);
    },
    invoke: function (event) {
        if (this.isViable()) {
            return this._executor.call(this._context, event);
        }
    }
};
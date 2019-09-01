// Debug log time start
var _logTimer = (new Date()).getTime();

if (!window._ua) {
    var _ua = navigator.userAgent.toLowerCase();
}
var cur = {}; // used in some functions
var browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|era|opr|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
    opera: (/opera/i.test(_ua) || /opr/i.test(_ua)),
    msie: (/msie/i.test(_ua) && !/opera/i.test(_ua) || /trident\//i.test(_ua)),
    msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
    msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
    msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
    msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
    mozilla: /firefox/i.test(_ua),
    chrome: /chrome/i.test(_ua),
    safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
    iphone: /iphone/i.test(_ua),
    ipod: /ipod/i.test(_ua),
    iphone4: /iphone.*OS 4/i.test(_ua),
    ipod4: /ipod.*OS 4/i.test(_ua),
    ipad: /ipad/i.test(_ua),
    android: /android/i.test(_ua),
    bada: /bada/i.test(_ua),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(_ua),
    msie_mobile: /iemobile/i.test(_ua),
    safari_mobile: /iphone|ipod|ipad/i.test(_ua),
    opera_mobile: /opera mini|opera mobi/i.test(_ua),
    opera_mini: /opera mini/i.test(_ua),
    mac: /mac/i.test(_ua),
    windows: /windows/i.test(_ua),
    search_bot: /(yandex|google|stackrambler|aport|slurp|msnbot|bingbot|twitterbot|ia_archiver|facebookexternalhit)/i.test(_ua),
    da: /(da)/i.test(_ua)
};

/**
 * Bind polifill
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // ближайший аналог внутренней функции
            // IsCallable в ECMAScript 5
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

function observeStore(select, onChange, store) {
    var previousState = select(store.getState());

    function handleChange() {
        var currentState = select(store.getState());

        if (currentState !== previousState) {
            var previous = previousState;
            previousState = currentState;
            onChange(previous, currentState, unsubscribe);
        }
    }

    var unsubscribe = store.subscribe(handleChange);
    return unsubscribe;
}

if (!window.bodyNode) {
    window.bodyNode = document.getElementsByTagName('body')[0];
    window.headNode = document.getElementsByTagName('head')[0];
    window.htmlNode = document.getElementsByTagName('html')[0];
    window.pageNode = ge('container');
    window.utilsNode = ge('utils');
    window.scrollNode = browser.msie6 ? pageNode : ((browser.chrome || browser.safari) ? bodyNode : htmlNode);
}

window.phone_mask = "+7(999)999-99-99";
window.locHost = location.host;
window.locProtocol = location.protocol;
window.locHash = location.hash.replace('#/', '').replace('#!', '');
window.locBase = location.toString().replace(/#.+$/, '');
if (!window.locDomain) {
    var locDomain = location.host.toString().match(/[a-zA-Z0-9\-]+\.[a-zA-Z0-9]+\.?$/);
    if (locDomain !== null && isset(locDomain[0])) {
        locDomain = locDomain[0];
    } else {
        locDomain = 'localhost';
    }
}

//
// Events
//
var KEY = window.KEY = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DEL: 8,
    TAB: 9,
    RETURN: 13,
    ENTER: 13,
    ESC: 27,
    PAGEUP: 33,
    PAGEDOWN: 34,
    SPACE: 32
};

function observer(select, handler, container) {
    var val = select(container);

    return function () {
        var new_val = select(container);
        if (val !== new_val) {
            val = new_val;
            handler(container);
        }
    };
}

function addEvent(elem, types, handler, custom, context, useCapture) {
    elem = ge(elem);
    if (!elem || elem.nodeType == 3 || elem.nodeType == 8) { // 3 - Node.TEXT_NODE, 8 - Node.COMMENT_NODE
        return;
    }

    var realHandler = context ? function () {
        var newHandler = function (e) {
            var prevData = e.data;
            e.data = context;
            var ret = handler.apply(this, [e]);
            e.data = prevData;
            return ret;
        };
        newHandler.handler = handler;
        return newHandler;
    }() : handler;

    // For IE
    if (elem.setInterval && elem != window) elem = window;

    var events = data(elem, 'events') || data(elem, 'events', {}),
        handle = data(elem, 'handle') || data(elem, 'handle', function () {
            _eventHandle.apply(arguments.callee.elem, arguments);
        });
    // to prevent a memory leak
    handle.elem = elem;

    each(types.split(/\s+/), function (index, type) {
        if (!events[type]) {
            events[type] = [];
            if (!custom && elem.addEventListener) {
                elem.addEventListener(type, handle, useCapture);
            } else if (!custom && elem.attachEvent) {
                elem.attachEvent('on' + type, handle);
            }
        }
        events[type].push(realHandler);
    });

    elem = null;
}

function removeEvent(elem, types, handler) {
    elem = ge(elem);
    if (!elem) return;
    var events = data(elem, 'events');
    if (!events) return;
    if (typeof (types) != 'string') {
        for (var i in events) {
            removeEvent(elem, i);
        }
        return;
    }

    each(types.split(/\s+/), function (index, type) {
        if (!isArray(events[type])) return;
        var l = events[type].length;
        if (isFunction(handler)) {
            for (var i = l - 1; i >= 0; i--) {
                if (events[type][i] && (events[type][i] === handler || events[type][i].handler === handler)) {
                    events[type].splice(i, 1);
                    l--;
                    break;
                }
            }
        } else {
            for (var i = 0; i < l; i++) {
                delete events[type][i];
            }
            l = 0;
        }
        if (!l) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, data(elem, 'handle'), false);
            } else if (elem.detachEvent) {
                elem.detachEvent('on' + type, data(elem, 'handle'));
            }
            delete events[type];
        }
    });
    if (isEmpty(events)) {
        removeData(elem, 'events')
        removeData(elem, 'handle')
    }
}

function triggerEvent(elem, type, ev, now) {
    elem = ge(elem);
    var handle = data(elem, 'handle');
    if (handle) {
        var f = function () {
            handle.call(elem, extend((ev || {}), {type: type, target: elem}))
        };
        now ? f() : setTimeout(f, 0);
    }
}

function removeFromArray(el, array) {
    if (inArray(el, array)) {
        array.splice(array.indexOf(el), 1);
    }
    return array;
}

function cancelEvent(event) {
    event = (event || window.event);
    if (!event) return false;
    while (event.originalEvent) {
        event = event.originalEvent;
    }
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    event.cancelBubble = true;
    event.returnValue = false;
    return false;
}

function _eventHandle(event) {
    event = normEvent(event);

    var handlers = data(this, 'events');
    if (!handlers || typeof (event.type) != 'string' || !handlers[event.type] || !handlers[event.type].length) {
        return;
    }

    var eventHandlers = (handlers[event.type] || []).slice();
    for (var i in eventHandlers) {
        if (event.type == 'mouseover' || event.type == 'mouseout') {
            var parent = event.relatedElement;
            while (parent && parent != this) {
                try {
                    parent = parent.parentNode;
                } catch (e) {
                    parent = this;
                }
            }
            if (parent == this) {
                continue
            }
        }
        var ret = eventHandlers[i].apply(this, arguments);
        if (ret === false || ret === -1) {
            cancelEvent(event);
        }
        if (ret === -1) {
            return false;
        }
    }
}

function normEvent(event) {
    event = event || window.event;

    var originalEvent = event;
    event = clone(originalEvent);
    event.originalEvent = originalEvent;

    if (!event.target) {
        event.target = event.srcElement || document;
    }

    // check if target is a textnode (safari)
    if (event.target.nodeType == 3) {
        event.target = event.target.parentNode;
    }

    if (!event.relatedTarget && event.fromElement) {
        event.relatedTarget = event.fromElement == event.target;
    }

    if (event.pageX == null && event.clientX != null) {
        var doc = document.documentElement, body = bodyNode;
        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode)) {
        event.which = event.charCode || event.keyCode;
    }

    if (!event.metaKey && event.ctrlKey) {
        event.metaKey = event.ctrlKey;
    } else if (!event.ctrlKey && event.metaKey && browser.mac) {
        event.ctrlKey = event.metaKey;
    }

    // click: 1 == left; 2 == middle; 3 == right
    if (!event.which && event.button) {
        event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
    }

    return event;
}

//
// JSON
//
var parseJSON = (window.JSON && JSON.parse) ? function (obj) {
    try {
        return JSON.parse(obj);
    } catch (e) {
        w.log('parseJSON: ' + e.message, obj);
        return eval('(' + obj + ')');
    }
} : function (obj) {
    return eval('(' + obj + ')');
};

//
// useful utils
//

function getTime() {
    return Math.round((new Date).getTime() / 1000);
}

function getMicroTime() {
    return (new Date).getTime();
}

function isset(val) {
    return typeof val !== 'undefined';
}

function rand(mi, ma) {
    return Math.random() * (ma - mi + 1) + mi;
}

function irand(mi, ma) {
    return Math.floor(rand(mi, ma));
}

function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]' && !(browser.msie8 && obj && obj.item !== 'undefined' && obj.namedItem !== 'undefined');
}

function isEmpty(o) {
    if (Object.prototype.toString.call(o) !== '[object Object]') {
        return false;
    }
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

function trim(text) {
    return (text || '').replace(/^\s+|\s+$/g, '');
}

function stripHTML(text) {
    return text ? text.replace(/<(?:.|\s)*?>/g, '') : '';
}

function escapeRE(s) {
    return s ? s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1') : '';
}

function intval(value) {
    if (value === true) return 1;
    return parseInt(value) || 0;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function floatval(value) {
    if (value === true) return 1;
    return parseFloat(value) || 0;
}

function positive(value) {
    value = intval(value);
    return value < 0 ? 0 : value;
}

function winToUtf(text) {
    return text.replace(/&#(\d\d+);/g, function (s, c) {
        c = intval(c);
        return (c >= 32) ? String.fromCharCode(c) : s;
    }).replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&');
}

function replaceEntities(str) {
    return se('<textarea>' + ((str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')) + '</textarea>').value;
}

function clean(str) {
    return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;') : '';
}

function unclean(str) {
    return replaceEntities(str.replace(/\t/g, "\n"));
}

function replaceAll(search, replace, str) {
    while (str.search(search) !== -1) {
        str = str.replace(search, replace);
    }
    return str;
}

function keysOf(object) {
    var keys = [];
    if (Object && Object.keys) {
        keys = Object.keys(object);
    } else {
        for (var i in object) {
            keys.push(i);
        }
    }
    return keys;
}

//
//  Arrays, objects
//

function each(object, callback) {
    if (!isObject(object) && typeof object.length !== 'undefined') {
        for (var i = 0, length = object.length; i < length; i++) {
            var value = object[i];
            if (callback.call(value, i, value) === false) break;
        }
    } else {
        for (var name in object) {
            if (!Object.prototype.hasOwnProperty.call(object, name)) continue;
            if (callback.call(object[name], name, object[name]) === false)
                break;
        }
    }

    return object;
}

function indexOf(arr, val, start) {
    for (var i = (start || 0), j = arr.length; i < j; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return -1;
}

function inArray(value, arr) {
    return indexOf(arr, value) != -1;
}

function clone(obj, req) {
    var newObj = isArray(obj) ? [] : {};
    for (var i in obj) {
        if (/webkit/i.test(_ua) && (i == 'layerX' || i == 'layerY')) continue;
        if (req && typeof (obj[i]) === 'object' && i !== 'prototype') {
            newObj[i] = clone(obj[i]);
        } else {
            newObj[i] = obj[i];
        }
    }
    return newObj;
}

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

function extend() {
    var a = arguments,
        target = a[0] || {},
        i = 1,
        l = a.length,
        deep = false,
        options;

    if (typeof target === 'boolean') {
        deep = target;
        target = a[1] || {};
        i = 2;
    }

    if (typeof target !== 'object' && !isFunction(target)) target = {};

    for (; i < l; ++i) {
        if ((options = a[i]) != null) {
            for (var name in options) {
                var src = target[name], copy = options[name];

                if (target === copy) continue;

                if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
                    target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}

function selectizeSearchValue(selectize, value) {
    for (var i in selectize.options) {
        if (selectize.options[i][selectize.settings.labelField] == value || selectize.options[i][selectize.settings.valueField] == value) {
            return selectize.options[i][selectize.settings.valueField];
        }
    }
}

function selectizeSetValue(selectize, value) {
    var search = selectizeSearchValue(selectize, value);
    if (search) {
        selectize.setValue(search);
    } else {
        selectize.$control.find('input')[0].setAttribute('placeholder', value);
        selectize.$control.find('input').css({width: '100%'});
    }
}

function declOfNum(number, titles) {
    var cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

//
// CSS classes
//
window.whitespaceRegex = /[\t\r\n\f]/g;

function hasClass(obj, name) {
    if (obj && obj.jquery) {
        return obj.hasClass(name);
    } else {
        obj = ge(obj);
        if (obj &&
            obj.nodeType === 1 &&
            (" " + obj.className + " ").replace(window.whitespaceRegex, " ").indexOf(" " + name + " ") >= 0) {
            return true;
        }
    }
    return false;
}

function addClass(obj, name) {
    if (obj && obj.jquery) {
        obj.addClass(name);
    } else if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            addClass(obj[i], name);
        }
    } else if ((obj = ge(obj)) && !hasClass(obj, name)) {
        obj.className = (obj.className ? obj.className + ' ' : '') + name;
    }
}

function removeClass(obj, name) {
    if (obj && obj.jquery) {
        obj.removeClass(name);
    } else if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            removeClass(obj[i], name);
        }
    } else if (obj = ge(obj)) {
        obj.className = trim((obj.className || '').replace((new RegExp('(\\s|^)' + name + '(\\s|$)')), ' '));
    }
}

function toggleClass(obj, name, v) {
    if (v === undefined) {
        v = !hasClass(obj, name);
    }
    (v ? addClass : removeClass)(obj, name);
    return v;
}

function replaceClass(obj, oldName, newName) {
    removeClass(obj, oldName);
    addClass(obj, newName);
}

function getStyle(elem, name, force) {
    elem = ge(elem);
    if (isArray(name)) {
        var res = {};
        each(name, function (i, v) {
            res[v] = getStyle(elem, v);
        });
        return res;
    }
    if (force === undefined) {
        force = true;
    }
    if (!force && name == 'opacity' && browser.msie === true) {
        filter = elem.style['filter'];
        return filter ? (filter.indexOf('opacity=') >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '1') : '';
    }
    if (!force && elem.style && (elem.style[name] || name == 'height')) {
        return elem.style[name];
    }

    var ret, defaultView = document.defaultView || window;
    if (defaultView.getComputedStyle) {
        name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
        var computedStyle = defaultView.getComputedStyle(elem, null);
        if (computedStyle) {
            ret = computedStyle.getPropertyValue(name);
        }
    } else if (elem.currentStyle) {
        if (name == 'opacity' && browser.msie) {
            var filter = elem.currentStyle['filter'];
            return filter && filter.indexOf('opacity=') >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '1';
        }
        var camelCase = name.replace(/\-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
        ret = elem.currentStyle[name] || elem.currentStyle[camelCase];
        //dummy fix for ie
        if (ret == 'auto') {
            ret = 0;
        }

        if (!/^\d+(px)?$/i.test(ret) && /^\d/.test(ret)) {
            var style = elem.style, left = style.left, rsLeft = elem.runtimeStyle.left;

            elem.runtimeStyle.left = elem.currentStyle.left;
            style.left = ret || 0;
            ret = style.pixelLeft + 'px';

            style.left = left;
            elem.runtimeStyle.left = rsLeft;
        }
    }

    if (force && (name == 'width' || name == 'height')) {
        var ret2 = getSize(elem, true)[({'width': 0, 'height': 1})[name]];
        ret = (intval(ret) ? Math.max(floatval(ret), ret2) : ret2) + 'px';
    }

    return ret;
}

function setStyle(elem, name, value) {
    elem = ge(elem);
    if (!elem) return;
    if (typeof name == 'object') {
        return each(name, function (k, v) {
            setStyle(elem, k, v);
        });
    }
    if (name == 'opacity') {
        if (browser.msie === true) {
            if ((value + '').length) {
                if (value !== 1) {
                    elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
                } else {
                    elem.style.filter = '';
                }
            } else {
                elem.style.cssText = elem.style.cssText.replace(/filter\s*:[^;]*/gi, '');
            }
            elem.style.zoom = 1;
        }
        elem.style.opacity = value;
    } else {
        try {
            var isN = typeof (value) == 'number';
            if (isN && (/height|width/i).test(name)) {
                value = Math.abs(value);
            }
            elem.style[name] = isN && !(/z-?index|font-?weight|opacity|zoom|line-?height/i).test(name) ? value + 'px' : value;
        } catch (e) {
            w.log('setStyle::error - ', [name, value]);
        }
    }
}

function getSize(elem, withoutBounds) {
    elem = ge(elem);
    var s = [0, 0], de = document.documentElement;
    if (elem == document) {
        s = [Math.max(
            de.clientWidth,
            bodyNode.scrollWidth, de.scrollWidth,
            bodyNode.offsetWidth, de.offsetWidth
        ), Math.max(
            de.clientHeight,
            bodyNode.scrollHeight, de.scrollHeight,
            bodyNode.offsetHeight, de.offsetHeight
        )];
    } else if (elem) {
        function getWH() {
            s = [elem.offsetWidth, elem.offsetHeight];
            if (!withoutBounds) return;
            var padding = 0, border = 0;
            each(s, function (i, v) {
                var which = i ? ['Top', 'Bottom'] : ['Left', 'Right'];
                each(which, function () {
                    s[i] -= parseFloat(getStyle(elem, 'padding' + this)) || 0;
                    s[i] -= parseFloat(getStyle(elem, 'border' + this + 'Width')) || 0;
                });
            });
            s = [Math.round(s[0]), Math.round(s[1])];
        }

        if (!isVisible(elem)) {
            var props = {
                position: 'absolute',
                visibility: 'hidden',
                display: 'block'
            };
            var old = {};
            each(props, function (i, v) {
                old[i] = elem.style[i];
                elem.style[i] = v;
            });
            getWH();
            each(props, function (i, v) {
                elem.style[i] = old[i];
            });
        } else {
            getWH();
        }
    }
    return s;
}

function getXY(obj, forFixed) {
    obj = ge(obj);
    if (!obj) return [0, 0];

    var left = 0, top = 0, pos, lastLeft;
    if (obj.offsetParent) {
        do {
            left += (lastLeft = obj.offsetLeft);
            top += obj.offsetTop;
            pos = getStyle(obj, 'position');
            if (pos == 'fixed' || pos == 'absolute' || (pos == 'relative')) {
                left -= obj.scrollLeft;
                top -= obj.scrollTop;
                if (pos == 'fixed' && !forFixed) {
                    left += ((obj.offsetParent || {}).scrollLeft || bodyNode.scrollLeft || htmlNode.scrollLeft);
                    top += ((obj.offsetParent || {}).scrollTop || bodyNode.scrollTop || htmlNode.scrollTop);
                }
            }
        } while (obj = obj.offsetParent);
    }
    if (forFixed && browser.msie && intval(browser.version) < 9) {
        if (lastLeft) {
            left += ge('page_layout').offsetLeft;
        }
    }
    return [left, top];
}

function getZoom() {
    var r1 = ge('zoom_test_1') || document.body.appendChild(ce('div', {id: 'zoom_test_1'}, {
            left: '10%',
            position: 'absolute',
            visibility: 'hidden'
        })),
        r2 = ge('zoom_test_2') || document.body.appendChild(ce('div', {id: 'zoom_test_2'}, {
            left: r1.offsetLeft + 'px',
            position: 'absolute',
            visibility: 'hidden'
        }));
    return r2.offsetLeft / r1.offsetLeft;
}

function getRGB(color) {
    var result;
    if (color && isArray(color) && color.length == 3)
        return color;
    if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
        return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
    if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
        return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
    if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
        return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
}

function hide(elem) {
    var l = arguments.length;
    if (l > 1) {
        for (var i = 0; i < l; i++) {
            hide(arguments[i]);
        }
        return;
    }
    elem = ge(elem);
    if (!elem || !elem.style) return;
    var d = getStyle(elem, 'display');
    elem.olddisplay = (d != 'none') ? d : '';
    elem.style.display = 'none';
}

function show(elem) {
    if (arguments.length > 1) {
        for (var i = 0, l = arguments.length; i < l; ++i) {
            show(arguments[i]);
        }
        return;
    }
    elem = ge(elem);
    if (!elem || !elem.style) return;
    var old = elem.olddisplay, newStyle = 'block', tag = elem.tagName.toLowerCase();
    elem.style.display = old || '';

    if (getStyle(elem, 'display') == 'none') {
        if (hasClass(elem, 'inline')) {
            newStyle = 'inline';
        } else if (tag == 'tr' && !browser.msie) {
            newStyle = 'table-row';
        } else if (tag == 'table' && !browser.msie) {
            newStyle = 'table';
        } else {
            newStyle = 'block';
        }
        elem.style.display = elem.olddisplay = newStyle;
    }
}

function toggle(elem, v) {
    if (v === undefined) {
        v = !isVisible(elem);
    }
    if (v) {
        show(elem);
    } else {
        hide(elem);
    }
}

function isVisible(elem) {
    elem = ge(elem);
    if (!elem || !elem.style) return false;
    return getStyle(elem, 'display') != 'none';
}

function notaBene(el, color, nofocus) {
    el = ge(el);
    if (!el) return;

    if (!nofocus) elfocus(el);
    if (data(el, 'backstyle') === undefined) data(el, 'backstyle', el.style.backgroundColor || '');
    var colors = {notice: '#FFFFE0', warning: '#FAEAEA'};
    setStyle(el, 'backgroundColor', colors[color] || color || colors.warning);
    setTimeout(function () {
        el.style.backgroundColor = data(el, 'backstyle');
    }, 400);
}

//
// Store data connected to element
//

function data(el, name, data) {
    el = ge(el);
    if (!el) return false;
    if (!name) return false;

    var name2 = 'data-' + name;
    if (data !== undefined) {
        return el.setAttribute(name2, data);
    }

    return el.getAttribute(name2);
}

function removeData(el, name) {
    el = ge(el);
    if (!el) return false;
    if (!name) return false;

    var name2 = 'data-' + name;
    return el.removeAttribute(name2);
}

//
// scroll
//

function scrollToY(y) {
    scrollTo(scrollGetX(), y);
}

function scrollToTop() {
    return scrollToY(0);
}

function scrollGetX() {
    return window.pageXOffset || scrollNode.scrollLeft || document.documentElement.scrollLeft;
}

function scrollGetY() {
    return window.pageYOffset || scrollNode.scrollTop || document.documentElement.scrollTop;
}

//
// DOM
//

function ge(el) {
    return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}

function geByTag(searchTag, node) {
    node = ge(node) || document;
    return node.getElementsByTagName(searchTag);
}

function geByTag1(searchTag, node) {
    node = ge(node) || document;
    return node.querySelector && node.querySelector(searchTag) || geByTag(searchTag, node)[0];
}

function geByClass(searchClass, node, tag) {
    node = ge(node) || document;
    tag = tag || '*';
    var classElements = [];

    if (browser.msie === false && node.querySelectorAll && tag != '*') {
        return node.querySelectorAll(tag + '.' + searchClass);
    }

    if (node.getElementsByClassName) {
        var nodes = node.getElementsByClassName(searchClass);
        if (tag != '*') {
            tag = tag.toUpperCase();
            for (var i = 0, l = nodes.length; i < l; ++i) {
                if (nodes[i].tagName.toUpperCase() == tag) {
                    classElements.push(nodes[i]);
                }
            }
        } else {
            classElements = Array.prototype.slice.call(nodes);
        }
        return classElements;
    }

    var els = geByTag(tag, node);
    var pattern = new RegExp('(^|\\s)' + searchClass + '(\\s|$)');
    for (var i = 0, l = els.length; i < l; ++i) {
        if (pattern.test(els[i].className)) {
            classElements.push(els[i]);
        }
    }

    return classElements;
}

function geByClass1(searchClass, node, tag) {
    node = node || document;
    tag = tag || '*';
    return browser.msie === false && node.querySelector && node.querySelector(tag + '.' + searchClass) || geByClass(searchClass, node, tag)[0];
}

function ce(tagName, attr, style) {
    var el = document.createElement(tagName);
    if (attr) {
        extend(el, attr);
    }
    if (style) {
        setStyle(el, style);
    }
    return el;
}

function re(el) {
    el = ge(el);
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
    return el;
}

function se(html) {
    return ce('div', {innerHTML: html}).firstChild;
}

function prependElement(parentID, child) {
    var parent = ge(parentID);
    parent.childNodes = parent.childNodes || [];
    parent.insertBefore(child, parent.childNodes[0]);
}

function insertAfter(referenceNode, node) {
    referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
}

function domEL(el, p) {
    p = p ? 'previousSibling' : 'nextSibling';
    while (el && !el.tagName) el = el[p];
    return el;
}

// return next element
function domNS(el) {
    return domEL((el || {}).nextSibling);
}

// return previous element
function domPS(el) {
    return domEL((el || {}).previousSibling, 1);
}

// return first child
function domFC(el) {
    return domEL((el || {}).firstChild);
}

// return last child
function domLC(el) {
    return domEL((el || {}).lastChild, 1);
}

// return parent
function domPN(el) {
    return (el || {}).parentNode;
}

function isAncestor(el, ancestor) {
    var current = ge(el);
    ancestor = ge(ancestor);
    if (!el || !ancestor) {
        return false;
    }
    while (current = current.parentNode) {
        if (current == ancestor) {
            return true;
        }
    }
    return false;
}

function elfocus(el, from, to) {
    el = ge(el);
    try {
        el.focus();
        if (from === undefined || from === false) from = el.value.length;
        if (to === undefined || to === false) to = from;
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd('character', to);
            range.moveStart('character', from);
            range.select();
        } else if (el.setSelectionRange) {
            el.setSelectionRange(from, to);
        }
    } catch (e) {
    }
}

//
// Checkbox
//
function isChecked(el) {
    el = ge(el);
    if (el && el.type && (el.type == 'checkbox' || el.type == 'radio')) {
        return el.checked ? 1 : '';
    } else {
        return hasClass(el, 'on') ? 1 : '';
    }
}

function checkbox(el, v) {
    if (!browser.msie6 || !browser.msie7) {
        el = ge(el);
        if (!el || hasClass(el, 'disabled')) {
            return;
        }

        if (v === undefined) {
            v = !isChecked(el);
        }
        if (el.type && (el.type == 'checkbox' || el.type == 'radio')) {
            el.checked = v ? true : false;
        } else {
            toggleClass(el, 'on', v);
        }
    }
}

//
// Other
//

function number_format(number, decimals, dec_point, thousands_sep) {
    // * example 1: number_format(1234.56);
    // * returns 1: '1,235'
    // * example 2: number_format(1234.56, 2, ',', ' ');
    // * returns 2: '1 234,56'
    // * example 3: number_format(1234.5678, 2, '.', '');
    // * returns 3: '1234.57'
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? '' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

function parseLatin(text) {
    var outtext = text, i, l,
        lat1 = ['yo', 'zh', 'kh', 'ts', 'ch', 'sch', 'shch', 'sh', 'eh', 'yu', 'ya', 'YO', 'ZH', 'KH', 'TS', 'CH', 'SCH', 'SHCH', 'SH', 'EH', 'YU', 'YA', "'"],
        rus1 = ['ё', 'ж', 'х', 'ц', 'ч', 'щ', 'щ', 'ш', 'э', 'ю', 'я', 'Ё', 'Ж', 'Х', 'Ц', 'Ч', 'Щ', 'Щ', 'Ш', 'Э', 'Ю', 'Я', 'ь'],
        lat2 = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ',
        rus2 = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';
    for (i = 0, l = lat1.length; i < l; i++) {
        outtext = outtext.split(lat1[i]).join(rus1[i]);
    }
    for (i = 0, l = lat2.length; i < l; i++) {
        outtext = outtext.split(lat2.charAt(i)).join(rus2.charAt(i));
    }
    return (outtext == text) ? null : outtext;
}

function parseCyr(text) {
    var t, outtext = text,
        n = ["yo", "zh", "kh", "ts", "ch", "sch", "shch", "sh", "eh", "yu", "ya", "YO", "ZH", "KH", "TS", "CH", "SCH", "SHCH", "SH", "EH", "YU", "YA", ""],
        i = ["ё", "ж", "х", "ц", "ч", "щ", "щ", "ш", "э", "ю", "я", "Ё", "Ж", "Х", "Ц", "Ч", "Щ", "Щ", "Ш", "Э", "Ю", "Я", "ь"],
        a = "abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ",
        r = "абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ";
    for (t = 0; t < i.length; t++)
        outtext = outtext.split(i[t]).join(n[t]);
    for (t = 0; t < r.length; t++)
        outtext = outtext.split(r.charAt(t)).join(a.charAt(t));
    return outtext == text ? null : outtext
}

function parseCyrAndSaniize(textcyr) {
    var v = parseCyr(textcyr);
    v = replaceAll(/[.]+/, '', v);
    v = replaceAll(/[\/\s]+/, '-', v);

    return v;
}

function sprintf() { // Return a formatted string
    var regex = /%%|%(\d+\$)?([\-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        var padding = (str.length >= len) ? '' : (new Array(1 + len - str.length >>> 0)).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, ' ', leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad) {
        if (precision !== null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad);
    };

    // finalFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        if (substring === '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
        for (var j = 0; flags && j < flags.length; j++) {
            switch (flags.charAt(j)) {
                case ' ':
                    positivePrefix = ' ';
                    break;
                case '+':
                    positivePrefix = '+';
                    break;
                case '-':
                    leftJustify = true;
                    break;
                case '0':
                    zeroPad = true;
                    break;
                case '#':
                    prefixBaseX = true;
                    break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth === '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) === '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : void (0);
        } else if (precision === '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) === '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++],
            number, prefix;

        switch (type) {
            case 's':
                return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
            case 'c':
                return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b':
                return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o':
                return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u':
                return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                number = parseInt(+value, 10);
                prefix = (number < 0 ? '-' : positivePrefix);
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G': {
                number = +value;
                prefix = (number < 0 ? '-' : positivePrefix);
                var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
            default:
                return substring;
        }
    };

    return format.replace(regex, doFormat);
}

//
// engine things
//
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

function parseFloat2(val) {
    val = val || 0;
    return Math.round(val.toString().replace(',', '.') * 100) / 100;
}

function parseAmount(amount) {
    return parseFloat2(amount);
}

function getDom(el) {
    var dom = null;
    if (typeof el == 'object') {
        dom = {};
        for (var i in el) {
            dom[i] = getDom(el[i]);
        }
    } else if (typeof el == 'string' || typeof el == 'number') {
        dom = ge(el);
    } else {
        w.log('getDom: incorrect type', el);
    }

    return dom;
}

function doUrl(url) {
    if (url && url.length) {
        if (url.substr(0, 4) != 'http') {
            if (url.substr(0, 1) != '/') {
                url = '/' + url;
            }
            if (url.search(w.root) !== 0) {
                url = w.root + url;
            }
            if (w.app_url.length && url.search(w.app_url) != 1) {
                url = '/' + w.app_url + url;
            }
        }
    }

    return url;
}

function getParameterFromUrlByName(name, url) {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Template engine (yet another)
 * @param prefix_selector
 * @returns {{}}
 */
function getTemplates(prefix_selector) {
    var d = {};
    if (typeof prefix_selector !== 'string') {
        prefix_selector = '';
    }

    $(prefix_selector + ' script[type="text/x-handlebars-template"]').each(function () {
        d[this.getAttribute('data-name')] = Handlebars.compile(this.innerHTML);
    });

    return d;
}

window.w = {
    log: function () {
        try {
            var t = '[' + number_format(((new Date()).getTime() - _logTimer) / 1000, 3, '.') + '] ';
            if (window.console && console.log) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(t);
                if (browser.msie === true) {
                    console.log(args.join(' '));
                } else {
                    console.log.apply(console, args);
                }
            }
        } catch (e) {
            console.log(e);
        }
    },
    register: function (data) {
        var json_ajax = JSON.stringify(data);
        var i;
        var item;
        var t = this;
        var data_in = {};

        if (data && !t.ajax[json_ajax]) {
            t.ajax[json_ajax] = data;

            if (data.button) {
                $(document).on('click', '.' + data.button, function () {
                    for (i = 0; i < data.fields.length; i++) {
                        item = $('#' + data.fields[i]);
                        data_in[item.attr('name')] = item.val();
                    }

                    $.ajax(data.url, {
                        type : data.type,
                        data: data_in,
                        success: function (data_out) {
                            if (isFunction(data.click.success) && data_out.code === 0) {
                                data.click.success(data_in);
                            }
                        },
                        error: function () {
                        },
                        complete: function () {
                        }
                    });
                });
            }
        }
    },
    ajax: {},
    fn: {}
};

(function (w, window, document) {

    w.fn.Tooltip = function (to, opts) {
        if (!(to = ge(to))) {
            return;
        }
        if (!opts) {
            opts = {};
        }

        var text = to.title.length > 0 ? to.title : (opts.text ? opts.text : '');
        if (text.length === 0) {
            return;
        }

        this.defaults = {
            placement: "right" // top, bottom, left, right
            //trigger   : "focus", // hover, focus
            //delay     : 0
        };

        this.guid++;
        this.size = getSize(to);
        this.text = text;
        this.id = to.id + '-tooltip';
        this.dop = opts.dop ? opts.dop : {};
        this.customTrigger = isset(opts.customTrigger) ? opts.customTrigger : false;
        this.className = opts.className ? opts.className : '';
        this.placement = opts.placement ? opts.placement : this.defaults.placement;
        this.Dom = {};

        this.Dom.container = ce('div', {
            id: this.id,
            className: 'tooltip-container hidden ' + this.className
        });
        this.Dom.tooltip = ce('div', {
            className: 'tooltip ' + this.placement
        });
        this.Dom.arrow = ce('div', {
            className: 'tooltip-arrow'
        });
        this.Dom.inner = ce('div', {
            className: 'tooltip-inner',
            innerHTML: this.text
        });

        this.Dom.tooltip.appendChild(this.Dom.arrow);
        this.Dom.tooltip.appendChild(this.Dom.inner);
        this.Dom.container.appendChild(this.Dom.tooltip);
        if (opts.customParent && ge(opts.customParent)) {
            opts.customParent = ge(opts.customParent);
            opts.customParent.parentNode.insertBefore(this.Dom.container, opts.customParent.nextSibling);
        } else {
            insertAfter(to, this.Dom.container);
        }

        this.to = to;
        // pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2
        this._reCalc();

        var ids = [to.id];
        for (var i in this.dop) {
            this.dop[i] = ge(this.dop[i]);
            if (this.dop[i]) {
                ids.push(this.dop[i].id);
            }
        }

        var t = this;
        if (!t.customTrigger) {
            if (to.tagName.toLowerCase() === 'div' || to.tagName.toLowerCase() === 'a') {
                $('#' + ids.join(', #')).hover(function () {
                    w.log(t);
                    t.show();
                }, function () {
                    t.hide();
                });
            }
            $(document).on('focus', '#' + ids.join(', #'), function () {
                t.show();
            });
            $(document).on('blur', '#' + ids.join(', #'), function () {
                t.hide();
            });
        }
    };
    w.fn.Tooltip.prototype = {
        constructor: w.fn.Tooltip,
        _reCalc: function () {
            removeClass(this.Dom.container, 'hidden');
            var tp = $(this.to).offset(),
                size_to = getSize(this.to),
                size_co = getSize(this.Dom.container);
            addClass(this.Dom.container, 'hidden');
            switch (this.placement) {
                case 'bottom':
                    tp = {
                        top: tp.top + size_to[1] + 5,
                        left: tp.left + (size_to[0] / 2) - (size_co[0] / 2)
                    };
                    break;
                case 'top':
                    tp = {
                        top: tp.top - size_co[1] - 5,
                        left: tp.left + (size_to[0] / 2) - (size_co[0] / 2)
                    };
                    break;
                case 'left':
                    tp = {
                        top: tp.top + (size_to[1] / 2) - (size_co[1] / 2) + 2,
                        left: tp.left - size_to[0] + (size_co[0] / 2)
                    };
                    break;
                case 'right':
                    tp = {
                        top: tp.top + (size_to[1] / 2) - (size_co[1] / 2) + 2,
                        left: tp.left + size_to[0] + 5
                    };
                    break;
            }
            this.Dom.container.style.top = tp.top + 'px';
            this.Dom.container.style.left = tp.left + 'px';
        },
        show: function () {
            this._reCalc();
            removeClass(this.Dom.container, 'hidden');
        },
        hide: function () {
            addClass(this.Dom.container, 'hidden');
        }
    };

})(w, window, document);

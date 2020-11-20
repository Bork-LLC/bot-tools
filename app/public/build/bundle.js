
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialApp.svelte generated by Svelte v3.29.4 */

    const file = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialApp.svelte";

    function create_fragment(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file, 12, 0, 202000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.29.4 */
    const file$1 = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let button_levels = [
    		{
    			class: button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0]
    		},
    		{ type: /*type*/ ctx[13] },
    		{ style: /*style*/ ctx[15] },
    		{ disabled: /*disabled*/ ctx[10] },
    		{ "aria-disabled": /*disabled*/ ctx[10] },
    		/*$$restProps*/ ctx[16]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$1, 44, 2, 5013);
    			set_attributes(button, button_data);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    			add_location(button, file$1, 25, 0, 4617);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button, /*ripple*/ ctx[14])),
    					listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*size, klass*/ 17 && button_class_value !== (button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0])) && { class: button_class_value },
    				(!current || dirty & /*type*/ 8192) && { type: /*type*/ ctx[13] },
    				(!current || dirty & /*style*/ 32768) && { style: /*style*/ ctx[15] },
    				(!current || dirty & /*disabled*/ 1024) && { disabled: /*disabled*/ ctx[10] },
    				(!current || dirty & /*disabled*/ 1024) && { "aria-disabled": /*disabled*/ ctx[10] },
    				dirty & /*$$restProps*/ 65536 && /*$$restProps*/ ctx[16]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 6144) Class_action.update.call(null, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 16384) Ripple_action.update.call(null, /*ripple*/ ctx[14]);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(0, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(15, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(15, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 0,
    			fab: 1,
    			icon: 2,
    			block: 3,
    			size: 4,
    			tile: 5,
    			text: 6,
    			depressed: 7,
    			outlined: 8,
    			rounded: 9,
    			disabled: 10,
    			active: 11,
    			activeClass: 12,
    			type: 13,
    			ripple: 14,
    			style: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var nouislider_min = createCommonjsModule(function (module, exports) {
    /* eslint-disable */
    /*! nouislider - 14.6.1 - 8/17/2020 */
    !(function (t) {
        (module.exports = t())
        ;
    })(function () {
      var lt = '14.6.1';
      function ut(t) {
        t.parentElement.removeChild(t);
      }
      function a(t) {
        return null != t;
      }
      function ct(t) {
        t.preventDefault();
      }
      function o(t) {
        return 'number' == typeof t && !isNaN(t) && isFinite(t);
      }
      function pt(t, e, r) {
        0 < r &&
          (ht(t, e),
          setTimeout(function () {
            mt(t, e);
          }, r));
      }
      function ft(t) {
        return Math.max(Math.min(t, 100), 0);
      }
      function dt(t) {
        return Array.isArray(t) ? t : [t];
      }
      function e(t) {
        var e = (t = String(t)).split('.');
        return 1 < e.length ? e[1].length : 0;
      }
      function ht(t, e) {
        t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
      }
      function mt(t, e) {
        t.classList && !/\s/.test(e)
          ? t.classList.remove(e)
          : (t.className = t.className.replace(
              new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'),
              ' ',
            ));
      }
      function gt(t) {
        var e = void 0 !== window.pageXOffset,
          r = 'CSS1Compat' === (t.compatMode || '');
        return {
          x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
          y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
        };
      }
      function c(t, e) {
        return 100 / (e - t);
      }
      function p(t, e, r) {
        return (100 * e) / (t[r + 1] - t[r]);
      }
      function f(t, e) {
        for (var r = 1; t >= e[r]; ) r += 1;
        return r;
      }
      function r(t, e, r) {
        if (r >= t.slice(-1)[0]) return 100;
        var n,
          i,
          o = f(r, t),
          s = t[o - 1],
          a = t[o],
          l = e[o - 1],
          u = e[o];
        return (
          l +
          ((i = r), p((n = [s, a]), n[0] < 0 ? i + Math.abs(n[0]) : i - n[0], 0) / c(l, u))
        );
      }
      function n(t, e, r, n) {
        if (100 === n) return n;
        var i,
          o,
          s = f(n, t),
          a = t[s - 1],
          l = t[s];
        return r
          ? (l - a) / 2 < n - a
            ? l
            : a
          : e[s - 1]
          ? t[s - 1] + ((i = n - t[s - 1]), (o = e[s - 1]), Math.round(i / o) * o)
          : n;
      }
      function s(t, e, r) {
        var n;
        if (('number' == typeof e && (e = [e]), !Array.isArray(e)))
          throw new Error('noUiSlider (' + lt + "): 'range' contains invalid value.");
        if (!o((n = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !o(e[0]))
          throw new Error('noUiSlider (' + lt + "): 'range' value isn't numeric.");
        r.xPct.push(n),
          r.xVal.push(e[0]),
          n ? r.xSteps.push(!isNaN(e[1]) && e[1]) : isNaN(e[1]) || (r.xSteps[0] = e[1]),
          r.xHighestCompleteStep.push(0);
      }
      function l(t, e, r) {
        if (e)
          if (r.xVal[t] !== r.xVal[t + 1]) {
            r.xSteps[t] = p([r.xVal[t], r.xVal[t + 1]], e, 0) / c(r.xPct[t], r.xPct[t + 1]);
            var n = (r.xVal[t + 1] - r.xVal[t]) / r.xNumSteps[t],
              i = Math.ceil(Number(n.toFixed(3)) - 1),
              o = r.xVal[t] + r.xNumSteps[t] * i;
            r.xHighestCompleteStep[t] = o;
          } else r.xSteps[t] = r.xHighestCompleteStep[t] = r.xVal[t];
      }
      function i(t, e, r) {
        var n;
        (this.xPct = []),
          (this.xVal = []),
          (this.xSteps = [r || !1]),
          (this.xNumSteps = [!1]),
          (this.xHighestCompleteStep = []),
          (this.snap = e);
        var i = [];
        for (n in t) t.hasOwnProperty(n) && i.push([t[n], n]);
        for (
          i.length && 'object' == typeof i[0][0]
            ? i.sort(function (t, e) {
                return t[0][0] - e[0][0];
              })
            : i.sort(function (t, e) {
                return t[0] - e[0];
              }),
            n = 0;
          n < i.length;
          n++
        )
          s(i[n][1], i[n][0], this);
        for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
          l(n, this.xNumSteps[n], this);
      }
      (i.prototype.getDistance = function (t) {
        var e,
          r = [];
        for (e = 0; e < this.xNumSteps.length - 1; e++) {
          var n = this.xNumSteps[e];
          if (n && (t / n) % 1 != 0)
            throw new Error(
              'noUiSlider (' +
                lt +
                "): 'limit', 'margin' and 'padding' of " +
                this.xPct[e] +
                '% range must be divisible by step.',
            );
          r[e] = p(this.xVal, t, e);
        }
        return r;
      }),
        (i.prototype.getAbsoluteDistance = function (t, e, r) {
          var n,
            i = 0;
          if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
          else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
          r || t !== this.xPct[i + 1] || i++;
          var o = 1,
            s = e[i],
            a = 0,
            l = 0,
            u = 0,
            c = 0;
          for (
            n = r
              ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
              : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
            0 < s;

          )
            (a = this.xPct[i + 1 + c] - this.xPct[i + c]),
              100 < e[i + c] * o + 100 - 100 * n
                ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
              r
                ? ((u -= l), 1 <= this.xPct.length + c && c--)
                : ((u += l), 1 <= this.xPct.length - c && c++),
              (s = e[i + c] * o);
          return t + u;
        }),
        (i.prototype.toStepping = function (t) {
          return (t = r(this.xVal, this.xPct, t));
        }),
        (i.prototype.fromStepping = function (t) {
          return (function (t, e, r) {
            if (100 <= r) return t.slice(-1)[0];
            var n,
              i = f(r, e),
              o = t[i - 1],
              s = t[i],
              a = e[i - 1],
              l = e[i];
            return (n = [o, s]), ((r - a) * c(a, l) * (n[1] - n[0])) / 100 + n[0];
          })(this.xVal, this.xPct, t);
        }),
        (i.prototype.getStep = function (t) {
          return (t = n(this.xPct, this.xSteps, this.snap, t));
        }),
        (i.prototype.getDefaultStep = function (t, e, r) {
          var n = f(t, this.xPct);
          return (
            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
            (this.xVal[n] - this.xVal[n - 1]) / r
          );
        }),
        (i.prototype.getNearbySteps = function (t) {
          var e = f(t, this.xPct);
          return {
            stepBefore: {
              startValue: this.xVal[e - 2],
              step: this.xNumSteps[e - 2],
              highestStep: this.xHighestCompleteStep[e - 2],
            },
            thisStep: {
              startValue: this.xVal[e - 1],
              step: this.xNumSteps[e - 1],
              highestStep: this.xHighestCompleteStep[e - 1],
            },
            stepAfter: {
              startValue: this.xVal[e],
              step: this.xNumSteps[e],
              highestStep: this.xHighestCompleteStep[e],
            },
          };
        }),
        (i.prototype.countStepDecimals = function () {
          var t = this.xNumSteps.map(e);
          return Math.max.apply(null, t);
        }),
        (i.prototype.convert = function (t) {
          return this.getStep(this.toStepping(t));
        });
      var u = {
          to: function (t) {
            return void 0 !== t && t.toFixed(2);
          },
          from: Number,
        },
        d = {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle',
          handleLower: 'handle-lower',
          handleUpper: 'handle-upper',
          touchArea: 'touch-area',
          horizontal: 'horizontal',
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          textDirectionLtr: 'txt-dir-ltr',
          textDirectionRtl: 'txt-dir-rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub',
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub',
        };
      function h(t) {
        if (
          'object' == typeof (e = t) &&
          'function' == typeof e.to &&
          'function' == typeof e.from
        )
          return !0;
        var e;
        throw new Error(
          'noUiSlider (' + lt + "): 'format' requires 'to' and 'from' methods.",
        );
      }
      function m(t, e) {
        if (!o(e)) throw new Error('noUiSlider (' + lt + "): 'step' is not numeric.");
        t.singleStep = e;
      }
      function g(t, e) {
        if (!o(e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardPageMultiplier' is not numeric.",
          );
        t.keyboardPageMultiplier = e;
      }
      function v(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'keyboardDefaultStep' is not numeric.");
        t.keyboardDefaultStep = e;
      }
      function b(t, e) {
        if ('object' != typeof e || Array.isArray(e))
          throw new Error('noUiSlider (' + lt + "): 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)
          throw new Error('noUiSlider (' + lt + "): Missing 'min' or 'max' in 'range'.");
        if (e.min === e.max)
          throw new Error(
            'noUiSlider (' + lt + "): 'range' 'min' and 'max' cannot be equal.",
          );
        t.spectrum = new i(e, t.snap, t.singleStep);
      }
      function x(t, e) {
        if (((e = dt(e)), !Array.isArray(e) || !e.length))
          throw new Error('noUiSlider (' + lt + "): 'start' option is incorrect.");
        (t.handles = e.length), (t.start = e);
      }
      function S(t, e) {
        if ('boolean' != typeof (t.snap = e))
          throw new Error('noUiSlider (' + lt + "): 'snap' option must be a boolean.");
      }
      function w(t, e) {
        if ('boolean' != typeof (t.animate = e))
          throw new Error('noUiSlider (' + lt + "): 'animate' option must be a boolean.");
      }
      function y(t, e) {
        if ('number' != typeof (t.animationDuration = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'animationDuration' option must be a number.",
          );
      }
      function E(t, e) {
        var r,
          n = [!1];
        if (
          ('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]),
          !0 === e || !1 === e)
        ) {
          for (r = 1; r < t.handles; r++) n.push(e);
          n.push(!1);
        } else {
          if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
            throw new Error(
              'noUiSlider (' + lt + "): 'connect' option doesn't match handle count.",
            );
          n = e;
        }
        t.connect = n;
      }
      function C(t, e) {
        switch (e) {
          case 'horizontal':
            t.ort = 0;
            break;
          case 'vertical':
            t.ort = 1;
            break;
          default:
            throw new Error('noUiSlider (' + lt + "): 'orientation' option is invalid.");
        }
      }
      function P(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'margin' option must be numeric.");
        0 !== e && (t.margin = t.spectrum.getDistance(e));
      }
      function N(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'limit' option must be numeric.");
        if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'limit' option is only supported on linear sliders with 2 or more handles.",
          );
      }
      function k(t, e) {
        var r;
        if (!o(e) && !Array.isArray(e))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (Array.isArray(e) && 2 !== e.length && !o(e[0]) && !o(e[1]))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (0 !== e) {
          for (
            Array.isArray(e) || (e = [e, e]),
              t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])],
              r = 0;
            r < t.spectrum.xNumSteps.length - 1;
            r++
          )
            if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
              throw new Error(
                'noUiSlider (' + lt + "): 'padding' option must be a positive number(s).",
              );
          var n = e[0] + e[1],
            i = t.spectrum.xVal[0];
          if (1 < n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i))
            throw new Error(
              'noUiSlider (' + lt + "): 'padding' option must not exceed 100% of the range.",
            );
        }
      }
      function U(t, e) {
        switch (e) {
          case 'ltr':
            t.dir = 0;
            break;
          case 'rtl':
            t.dir = 1;
            break;
          default:
            throw new Error(
              'noUiSlider (' + lt + "): 'direction' option was not recognized.",
            );
        }
      }
      function A(t, e) {
        if ('string' != typeof e)
          throw new Error(
            'noUiSlider (' + lt + "): 'behaviour' must be a string containing options.",
          );
        var r = 0 <= e.indexOf('tap'),
          n = 0 <= e.indexOf('drag'),
          i = 0 <= e.indexOf('fixed'),
          o = 0 <= e.indexOf('snap'),
          s = 0 <= e.indexOf('hover'),
          a = 0 <= e.indexOf('unconstrained');
        if (i) {
          if (2 !== t.handles)
            throw new Error(
              'noUiSlider (' + lt + "): 'fixed' behaviour must be used with 2 handles",
            );
          P(t, t.start[1] - t.start[0]);
        }
        if (a && (t.margin || t.limit))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'unconstrained' behaviour cannot be used with margin or limit",
          );
        t.events = { tap: r || o, drag: n, fixed: i, snap: o, hover: s, unconstrained: a };
      }
      function V(t, e) {
        if (!1 !== e)
          if (!0 === e) {
            t.tooltips = [];
            for (var r = 0; r < t.handles; r++) t.tooltips.push(!0);
          } else {
            if (((t.tooltips = dt(e)), t.tooltips.length !== t.handles))
              throw new Error(
                'noUiSlider (' + lt + '): must pass a formatter for all handles.',
              );
            t.tooltips.forEach(function (t) {
              if (
                'boolean' != typeof t &&
                ('object' != typeof t || 'function' != typeof t.to)
              )
                throw new Error(
                  'noUiSlider (' +
                    lt +
                    "): 'tooltips' must be passed a formatter or 'false'.",
                );
            });
          }
      }
      function D(t, e) {
        h((t.ariaFormat = e));
      }
      function M(t, e) {
        h((t.format = e));
      }
      function O(t, e) {
        if ('boolean' != typeof (t.keyboardSupport = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardSupport' option must be a boolean.",
          );
      }
      function L(t, e) {
        t.documentElement = e;
      }
      function z(t, e) {
        if ('string' != typeof e && !1 !== e)
          throw new Error(
            'noUiSlider (' + lt + "): 'cssPrefix' must be a string or `false`.",
          );
        t.cssPrefix = e;
      }
      function H(t, e) {
        if ('object' != typeof e)
          throw new Error('noUiSlider (' + lt + "): 'cssClasses' must be an object.");
        if ('string' == typeof t.cssPrefix)
          for (var r in ((t.cssClasses = {}), e))
            e.hasOwnProperty(r) && (t.cssClasses[r] = t.cssPrefix + e[r]);
        else t.cssClasses = e;
      }
      function vt(e) {
        var r = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: !0,
            animationDuration: 300,
            ariaFormat: u,
            format: u,
          },
          n = {
            step: { r: !1, t: m },
            keyboardPageMultiplier: { r: !1, t: g },
            keyboardDefaultStep: { r: !1, t: v },
            start: { r: !0, t: x },
            connect: { r: !0, t: E },
            direction: { r: !0, t: U },
            snap: { r: !1, t: S },
            animate: { r: !1, t: w },
            animationDuration: { r: !1, t: y },
            range: { r: !0, t: b },
            orientation: { r: !1, t: C },
            margin: { r: !1, t: P },
            limit: { r: !1, t: N },
            padding: { r: !1, t: k },
            behaviour: { r: !0, t: A },
            ariaFormat: { r: !1, t: D },
            format: { r: !1, t: M },
            tooltips: { r: !1, t: V },
            keyboardSupport: { r: !0, t: O },
            documentElement: { r: !1, t: L },
            cssPrefix: { r: !0, t: z },
            cssClasses: { r: !0, t: H },
          },
          i = {
            connect: !1,
            direction: 'ltr',
            behaviour: 'tap',
            orientation: 'horizontal',
            keyboardSupport: !0,
            cssPrefix: 'noUi-',
            cssClasses: d,
            keyboardPageMultiplier: 5,
            keyboardDefaultStep: 10,
          };
        e.format && !e.ariaFormat && (e.ariaFormat = e.format),
          Object.keys(n).forEach(function (t) {
            if (!a(e[t]) && void 0 === i[t]) {
              if (n[t].r)
                throw new Error('noUiSlider (' + lt + "): '" + t + "' is required.");
              return !0;
            }
            n[t].t(r, a(e[t]) ? e[t] : i[t]);
          }),
          (r.pips = e.pips);
        var t = document.createElement('div'),
          o = void 0 !== t.style.msTransform,
          s = void 0 !== t.style.transform;
        r.transformRule = s ? 'transform' : o ? 'msTransform' : 'webkitTransform';
        return (
          (r.style = [
            ['left', 'top'],
            ['right', 'bottom'],
          ][r.dir][r.ort]),
          r
        );
      }
      function j(t, b, o) {
        var l,
          u,
          s,
          c,
          i,
          a,
          e,
          p,
          f = window.navigator.pointerEnabled
            ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
            : window.navigator.msPointerEnabled
            ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
            : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
              },
          d =
            window.CSS &&
            CSS.supports &&
            CSS.supports('touch-action', 'none') &&
            (function () {
              var t = !1;
              try {
                var e = Object.defineProperty({}, 'passive', {
                  get: function () {
                    t = !0;
                  },
                });
                window.addEventListener('test', null, e);
              } catch (t) {}
              return t;
            })(),
          h = t,
          y = b.spectrum,
          x = [],
          S = [],
          m = [],
          g = 0,
          v = {},
          w = t.ownerDocument,
          E = b.documentElement || w.documentElement,
          C = w.body,
          P = -1,
          N = 0,
          k = 1,
          U = 2,
          A = 'rtl' === w.dir || 1 === b.ort ? 0 : 100;
        function V(t, e) {
          var r = w.createElement('div');
          return e && ht(r, e), t.appendChild(r), r;
        }
        function D(t, e) {
          var r = V(t, b.cssClasses.origin),
            n = V(r, b.cssClasses.handle);
          return (
            V(n, b.cssClasses.touchArea),
            n.setAttribute('data-handle', e),
            b.keyboardSupport &&
              (n.setAttribute('tabindex', '0'),
              n.addEventListener('keydown', function (t) {
                return (function (t, e) {
                  if (O() || L(e)) return !1;
                  var r = ['Left', 'Right'],
                    n = ['Down', 'Up'],
                    i = ['PageDown', 'PageUp'],
                    o = ['Home', 'End'];
                  b.dir && !b.ort
                    ? r.reverse()
                    : b.ort && !b.dir && (n.reverse(), i.reverse());
                  var s,
                    a = t.key.replace('Arrow', ''),
                    l = a === i[0],
                    u = a === i[1],
                    c = a === n[0] || a === r[0] || l,
                    p = a === n[1] || a === r[1] || u,
                    f = a === o[0],
                    d = a === o[1];
                  if (!(c || p || f || d)) return !0;
                  if ((t.preventDefault(), p || c)) {
                    var h = b.keyboardPageMultiplier,
                      m = c ? 0 : 1,
                      g = at(e),
                      v = g[m];
                    if (null === v) return !1;
                    !1 === v && (v = y.getDefaultStep(S[e], c, b.keyboardDefaultStep)),
                      (u || l) && (v *= h),
                      (v = Math.max(v, 1e-7)),
                      (v *= c ? -1 : 1),
                      (s = x[e] + v);
                  } else s = d ? b.spectrum.xVal[b.spectrum.xVal.length - 1] : b.spectrum.xVal[0];
                  return (
                    rt(e, y.toStepping(s), !0, !0),
                    J('slide', e),
                    J('update', e),
                    J('change', e),
                    J('set', e),
                    !1
                  );
                })(t, e);
              })),
            n.setAttribute('role', 'slider'),
            n.setAttribute('aria-orientation', b.ort ? 'vertical' : 'horizontal'),
            0 === e
              ? ht(n, b.cssClasses.handleLower)
              : e === b.handles - 1 && ht(n, b.cssClasses.handleUpper),
            r
          );
        }
        function M(t, e) {
          return !!e && V(t, b.cssClasses.connect);
        }
        function r(t, e) {
          return !!b.tooltips[e] && V(t.firstChild, b.cssClasses.tooltip);
        }
        function O() {
          return h.hasAttribute('disabled');
        }
        function L(t) {
          return u[t].hasAttribute('disabled');
        }
        function z() {
          i &&
            (G('update.tooltips'),
            i.forEach(function (t) {
              t && ut(t);
            }),
            (i = null));
        }
        function H() {
          z(),
            (i = u.map(r)),
            $('update.tooltips', function (t, e, r) {
              if (i[e]) {
                var n = t[e];
                !0 !== b.tooltips[e] && (n = b.tooltips[e].to(r[e])), (i[e].innerHTML = n);
              }
            });
        }
        function j(e, i, o) {
          var s = w.createElement('div'),
            a = [];
          (a[N] = b.cssClasses.valueNormal),
            (a[k] = b.cssClasses.valueLarge),
            (a[U] = b.cssClasses.valueSub);
          var l = [];
          (l[N] = b.cssClasses.markerNormal),
            (l[k] = b.cssClasses.markerLarge),
            (l[U] = b.cssClasses.markerSub);
          var u = [b.cssClasses.valueHorizontal, b.cssClasses.valueVertical],
            c = [b.cssClasses.markerHorizontal, b.cssClasses.markerVertical];
          function p(t, e) {
            var r = e === b.cssClasses.value,
              n = r ? a : l;
            return e + ' ' + (r ? u : c)[b.ort] + ' ' + n[t];
          }
          return (
            ht(s, b.cssClasses.pips),
            ht(s, 0 === b.ort ? b.cssClasses.pipsHorizontal : b.cssClasses.pipsVertical),
            Object.keys(e).forEach(function (t) {
              !(function (t, e, r) {
                if ((r = i ? i(e, r) : r) !== P) {
                  var n = V(s, !1);
                  (n.className = p(r, b.cssClasses.marker)),
                    (n.style[b.style] = t + '%'),
                    N < r &&
                      (((n = V(s, !1)).className = p(r, b.cssClasses.value)),
                      n.setAttribute('data-value', e),
                      (n.style[b.style] = t + '%'),
                      (n.innerHTML = o.to(e)));
                }
              })(t, e[t][0], e[t][1]);
            }),
            s
          );
        }
        function F() {
          c && (ut(c), (c = null));
        }
        function R(t) {
          F();
          var m,
            g,
            v,
            b,
            e,
            r,
            x,
            S,
            w,
            n = t.mode,
            i = t.density || 1,
            o = t.filter || !1,
            s = (function (t, e, r) {
              if ('range' === t || 'steps' === t) return y.xVal;
              if ('count' === t) {
                if (e < 2)
                  throw new Error(
                    'noUiSlider (' + lt + "): 'values' (>= 2) required for mode 'count'.",
                  );
                var n = e - 1,
                  i = 100 / n;
                for (e = []; n--; ) e[n] = n * i;
                e.push(100), (t = 'positions');
              }
              return 'positions' === t
                ? e.map(function (t) {
                    return y.fromStepping(r ? y.getStep(t) : t);
                  })
                : 'values' === t
                ? r
                  ? e.map(function (t) {
                      return y.fromStepping(y.getStep(y.toStepping(t)));
                    })
                  : e
                : void 0;
            })(n, t.values || !1, t.stepped || !1),
            a =
              ((m = i),
              (g = n),
              (v = s),
              (b = {}),
              (e = y.xVal[0]),
              (r = y.xVal[y.xVal.length - 1]),
              (S = x = !1),
              (w = 0),
              (v = v
                .slice()
                .sort(function (t, e) {
                  return t - e;
                })
                .filter(function (t) {
                  return !this[t] && (this[t] = !0);
                }, {}))[0] !== e && (v.unshift(e), (x = !0)),
              v[v.length - 1] !== r && (v.push(r), (S = !0)),
              v.forEach(function (t, e) {
                var r,
                  n,
                  i,
                  o,
                  s,
                  a,
                  l,
                  u,
                  c,
                  p,
                  f = t,
                  d = v[e + 1],
                  h = 'steps' === g;
                if ((h && (r = y.xNumSteps[e]), r || (r = d - f), !1 !== f))
                  for (
                    void 0 === d && (d = f), r = Math.max(r, 1e-7), n = f;
                    n <= d;
                    n = (n + r).toFixed(7) / 1
                  ) {
                    for (
                      u = (s = (o = y.toStepping(n)) - w) / m,
                        p = s / (c = Math.round(u)),
                        i = 1;
                      i <= c;
                      i += 1
                    )
                      b[(a = w + i * p).toFixed(5)] = [y.fromStepping(a), 0];
                    (l = -1 < v.indexOf(n) ? k : h ? U : N),
                      !e && x && n !== d && (l = 0),
                      (n === d && S) || (b[o.toFixed(5)] = [n, l]),
                      (w = o);
                  }
              }),
              b),
            l = t.format || { to: Math.round };
          return (c = h.appendChild(j(a, o, l)));
        }
        function T() {
          var t = l.getBoundingClientRect(),
            e = 'offset' + ['Width', 'Height'][b.ort];
          return 0 === b.ort ? t.width || l[e] : t.height || l[e];
        }
        function B(n, i, o, s) {
          var e = function (t) {
              return (
                !!(t = (function (t, e, r) {
                  var n,
                    i,
                    o = 0 === t.type.indexOf('touch'),
                    s = 0 === t.type.indexOf('mouse'),
                    a = 0 === t.type.indexOf('pointer');
                  0 === t.type.indexOf('MSPointer') && (a = !0);
                  if (o) {
                    var l = function (t) {
                      return (
                        t.target === r ||
                        r.contains(t.target) ||
                        (t.target.shadowRoot && t.target.shadowRoot.contains(r))
                      );
                    };
                    if ('touchstart' === t.type) {
                      var u = Array.prototype.filter.call(t.touches, l);
                      if (1 < u.length) return !1;
                      (n = u[0].pageX), (i = u[0].pageY);
                    } else {
                      var c = Array.prototype.find.call(t.changedTouches, l);
                      if (!c) return !1;
                      (n = c.pageX), (i = c.pageY);
                    }
                  }
                  (e = e || gt(w)),
                    (s || a) && ((n = t.clientX + e.x), (i = t.clientY + e.y));
                  return (t.pageOffset = e), (t.points = [n, i]), (t.cursor = s || a), t;
                })(t, s.pageOffset, s.target || i)) &&
                !(O() && !s.doNotReject) &&
                ((e = h),
                (r = b.cssClasses.tap),
                !(
                  (e.classList
                    ? e.classList.contains(r)
                    : new RegExp('\\b' + r + '\\b').test(e.className)) && !s.doNotReject
                ) &&
                  !(n === f.start && void 0 !== t.buttons && 1 < t.buttons) &&
                  (!s.hover || !t.buttons) &&
                  (d || t.preventDefault(), (t.calcPoint = t.points[b.ort]), void o(t, s)))
              );
              var e, r;
            },
            r = [];
          return (
            n.split(' ').forEach(function (t) {
              i.addEventListener(t, e, !!d && { passive: !0 }), r.push([t, e]);
            }),
            r
          );
        }
        function q(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            a =
              (100 *
                (t -
                  ((e = l),
                  (r = b.ort),
                  (n = e.getBoundingClientRect()),
                  (i = e.ownerDocument),
                  (o = i.documentElement),
                  (s = gt(i)),
                  /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (s.x = 0),
                  r ? n.top + s.y - o.clientTop : n.left + s.x - o.clientLeft))) /
              T();
          return (a = ft(a)), b.dir ? 100 - a : a;
        }
        function X(t, e) {
          'mouseout' === t.type &&
            'HTML' === t.target.nodeName &&
            null === t.relatedTarget &&
            _(t, e);
        }
        function Y(t, e) {
          if (
            -1 === navigator.appVersion.indexOf('MSIE 9') &&
            0 === t.buttons &&
            0 !== e.buttonsProperty
          )
            return _(t, e);
          var r = (b.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
          Z(0 < r, (100 * r) / e.baseSize, e.locations, e.handleNumbers);
        }
        function _(t, e) {
          e.handle && (mt(e.handle, b.cssClasses.active), (g -= 1)),
            e.listeners.forEach(function (t) {
              E.removeEventListener(t[0], t[1]);
            }),
            0 === g &&
              (mt(h, b.cssClasses.drag),
              et(),
              t.cursor && ((C.style.cursor = ''), C.removeEventListener('selectstart', ct))),
            e.handleNumbers.forEach(function (t) {
              J('change', t), J('set', t), J('end', t);
            });
        }
        function I(t, e) {
          if (e.handleNumbers.some(L)) return !1;
          var r;
          1 === e.handleNumbers.length &&
            ((r = u[e.handleNumbers[0]].children[0]), (g += 1), ht(r, b.cssClasses.active));
          t.stopPropagation();
          var n = [],
            i = B(f.move, E, Y, {
              target: t.target,
              handle: r,
              listeners: n,
              startCalcPoint: t.calcPoint,
              baseSize: T(),
              pageOffset: t.pageOffset,
              handleNumbers: e.handleNumbers,
              buttonsProperty: t.buttons,
              locations: S.slice(),
            }),
            o = B(f.end, E, _, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            }),
            s = B('mouseout', E, X, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            });
          n.push.apply(n, i.concat(o, s)),
            t.cursor &&
              ((C.style.cursor = getComputedStyle(t.target).cursor),
              1 < u.length && ht(h, b.cssClasses.drag),
              C.addEventListener('selectstart', ct, !1)),
            e.handleNumbers.forEach(function (t) {
              J('start', t);
            });
        }
        function n(t) {
          if (!t.buttons && !t.touches) return !1;
          t.stopPropagation();
          var i,
            o,
            s,
            e = q(t.calcPoint),
            r =
              ((i = e),
              (s = !(o = 100)),
              u.forEach(function (t, e) {
                if (!L(e)) {
                  var r = S[e],
                    n = Math.abs(r - i);
                  (n < o || (n <= o && r < i) || (100 === n && 100 === o)) &&
                    ((s = e), (o = n));
                }
              }),
              s);
          if (!1 === r) return !1;
          b.events.snap || pt(h, b.cssClasses.tap, b.animationDuration),
            rt(r, e, !0, !0),
            et(),
            J('slide', r, !0),
            J('update', r, !0),
            J('change', r, !0),
            J('set', r, !0),
            b.events.snap && I(t, { handleNumbers: [r] });
        }
        function W(t) {
          var e = q(t.calcPoint),
            r = y.getStep(e),
            n = y.fromStepping(r);
          Object.keys(v).forEach(function (t) {
            'hover' === t.split('.')[0] &&
              v[t].forEach(function (t) {
                t.call(a, n);
              });
          });
        }
        function $(t, e) {
          (v[t] = v[t] || []),
            v[t].push(e),
            'update' === t.split('.')[0] &&
              u.forEach(function (t, e) {
                J('update', e);
              });
        }
        function G(t) {
          var n = t && t.split('.')[0],
            i = n && t.substring(n.length);
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0],
              r = t.substring(e.length);
            (n && n !== e) || (i && i !== r) || delete v[t];
          });
        }
        function J(r, n, i) {
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0];
            r === e &&
              v[t].forEach(function (t) {
                t.call(a, x.map(b.format.to), n, x.slice(), i || !1, S.slice(), a);
              });
          });
        }
        function K(t, e, r, n, i, o) {
          var s;
          return (
            1 < u.length &&
              !b.events.unconstrained &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.margin, 0)), (r = Math.max(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.margin, 1)), (r = Math.min(r, s)))),
            1 < u.length &&
              b.limit &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.limit, 0)), (r = Math.min(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.limit, 1)), (r = Math.max(r, s)))),
            b.padding &&
              (0 === e &&
                ((s = y.getAbsoluteDistance(0, b.padding[0], 0)), (r = Math.max(r, s))),
              e === u.length - 1 &&
                ((s = y.getAbsoluteDistance(100, b.padding[1], 1)), (r = Math.min(r, s)))),
            !((r = ft((r = y.getStep(r)))) === t[e] && !o) && r
          );
        }
        function Q(t, e) {
          var r = b.ort;
          return (r ? e : t) + ', ' + (r ? t : e);
        }
        function Z(t, n, r, e) {
          var i = r.slice(),
            o = [!t, t],
            s = [t, !t];
          (e = e.slice()),
            t && e.reverse(),
            1 < e.length
              ? e.forEach(function (t, e) {
                  var r = K(i, t, i[t] + n, o[e], s[e], !1);
                  !1 === r ? (n = 0) : ((n = r - i[t]), (i[t] = r));
                })
              : (o = s = [!0]);
          var a = !1;
          e.forEach(function (t, e) {
            a = rt(t, r[t] + n, o[e], s[e]) || a;
          }),
            a &&
              e.forEach(function (t) {
                J('update', t), J('slide', t);
              });
        }
        function tt(t, e) {
          return b.dir ? 100 - t - e : t;
        }
        function et() {
          m.forEach(function (t) {
            var e = 50 < S[t] ? -1 : 1,
              r = 3 + (u.length + e * t);
            u[t].style.zIndex = r;
          });
        }
        function rt(t, e, r, n) {
          return (
            !1 !== (e = K(S, t, e, r, n, !1)) &&
            ((function (t, e) {
              (S[t] = e), (x[t] = y.fromStepping(e));
              var r = 'translate(' + Q(10 * (tt(e, 0) - A) + '%', '0') + ')';
              (u[t].style[b.transformRule] = r), nt(t), nt(t + 1);
            })(t, e),
            !0)
          );
        }
        function nt(t) {
          if (s[t]) {
            var e = 0,
              r = 100;
            0 !== t && (e = S[t - 1]), t !== s.length - 1 && (r = S[t]);
            var n = r - e,
              i = 'translate(' + Q(tt(e, n) + '%', '0') + ')',
              o = 'scale(' + Q(n / 100, '1') + ')';
            s[t].style[b.transformRule] = i + ' ' + o;
          }
        }
        function it(t, e) {
          return null === t || !1 === t || void 0 === t
            ? S[e]
            : ('number' == typeof t && (t = String(t)),
              (t = b.format.from(t)),
              !1 === (t = y.toStepping(t)) || isNaN(t) ? S[e] : t);
        }
        function ot(t, e) {
          var r = dt(t),
            n = void 0 === S[0];
          (e = void 0 === e || !!e),
            b.animate && !n && pt(h, b.cssClasses.tap, b.animationDuration),
            m.forEach(function (t) {
              rt(t, it(r[t], t), !0, !1);
            });
          for (var i = 1 === m.length ? 0 : 1; i < m.length; ++i)
            m.forEach(function (t) {
              rt(t, S[t], !0, !0);
            });
          et(),
            m.forEach(function (t) {
              J('update', t), null !== r[t] && e && J('set', t);
            });
        }
        function st() {
          var t = x.map(b.format.to);
          return 1 === t.length ? t[0] : t;
        }
        function at(t) {
          var e = S[t],
            r = y.getNearbySteps(e),
            n = x[t],
            i = r.thisStep.step,
            o = null;
          if (b.snap)
            return [n - r.stepBefore.startValue || null, r.stepAfter.startValue - n || null];
          !1 !== i && n + i > r.stepAfter.startValue && (i = r.stepAfter.startValue - n),
            (o =
              n > r.thisStep.startValue
                ? r.thisStep.step
                : !1 !== r.stepBefore.step && n - r.stepBefore.highestStep),
            100 === e ? (i = null) : 0 === e && (o = null);
          var s = y.countStepDecimals();
          return (
            null !== i && !1 !== i && (i = Number(i.toFixed(s))),
            null !== o && !1 !== o && (o = Number(o.toFixed(s))),
            [o, i]
          );
        }
        return (
          ht((e = h), b.cssClasses.target),
          0 === b.dir ? ht(e, b.cssClasses.ltr) : ht(e, b.cssClasses.rtl),
          0 === b.ort ? ht(e, b.cssClasses.horizontal) : ht(e, b.cssClasses.vertical),
          ht(
            e,
            'rtl' === getComputedStyle(e).direction
              ? b.cssClasses.textDirectionRtl
              : b.cssClasses.textDirectionLtr,
          ),
          (l = V(e, b.cssClasses.base)),
          (function (t, e) {
            var r = V(e, b.cssClasses.connects);
            (u = []), (s = []).push(M(r, t[0]));
            for (var n = 0; n < b.handles; n++)
              u.push(D(e, n)), (m[n] = n), s.push(M(r, t[n + 1]));
          })(b.connect, l),
          (p = b.events).fixed ||
            u.forEach(function (t, e) {
              B(f.start, t.children[0], I, { handleNumbers: [e] });
            }),
          p.tap && B(f.start, l, n, {}),
          p.hover && B(f.move, l, W, { hover: !0 }),
          p.drag &&
            s.forEach(function (t, e) {
              if (!1 !== t && 0 !== e && e !== s.length - 1) {
                var r = u[e - 1],
                  n = u[e],
                  i = [t];
                ht(t, b.cssClasses.draggable),
                  p.fixed && (i.push(r.children[0]), i.push(n.children[0])),
                  i.forEach(function (t) {
                    B(f.start, t, I, { handles: [r, n], handleNumbers: [e - 1, e] });
                  });
              }
            }),
          ot(b.start),
          b.pips && R(b.pips),
          b.tooltips && H(),
          $('update', function (t, e, s, r, a) {
            m.forEach(function (t) {
              var e = u[t],
                r = K(S, t, 0, !0, !0, !0),
                n = K(S, t, 100, !0, !0, !0),
                i = a[t],
                o = b.ariaFormat.to(s[t]);
              (r = y.fromStepping(r).toFixed(1)),
                (n = y.fromStepping(n).toFixed(1)),
                (i = y.fromStepping(i).toFixed(1)),
                e.children[0].setAttribute('aria-valuemin', r),
                e.children[0].setAttribute('aria-valuemax', n),
                e.children[0].setAttribute('aria-valuenow', i),
                e.children[0].setAttribute('aria-valuetext', o);
            });
          }),
          (a = {
            destroy: function () {
              for (var t in b.cssClasses)
                b.cssClasses.hasOwnProperty(t) && mt(h, b.cssClasses[t]);
              for (; h.firstChild; ) h.removeChild(h.firstChild);
              delete h.noUiSlider;
            },
            steps: function () {
              return m.map(at);
            },
            on: $,
            off: G,
            get: st,
            set: ot,
            setHandle: function (t, e, r) {
              if (!(0 <= (t = Number(t)) && t < m.length))
                throw new Error('noUiSlider (' + lt + '): invalid handle number, got: ' + t);
              rt(t, it(e, t), !0, !0), J('update', t), r && J('set', t);
            },
            reset: function (t) {
              ot(b.start, t);
            },
            __moveHandles: function (t, e, r) {
              Z(t, e, S, r);
            },
            options: o,
            updateOptions: function (e, t) {
              var r = st(),
                n = [
                  'margin',
                  'limit',
                  'padding',
                  'range',
                  'animate',
                  'snap',
                  'step',
                  'format',
                  'pips',
                  'tooltips',
                ];
              n.forEach(function (t) {
                void 0 !== e[t] && (o[t] = e[t]);
              });
              var i = vt(o);
              n.forEach(function (t) {
                void 0 !== e[t] && (b[t] = i[t]);
              }),
                (y = i.spectrum),
                (b.margin = i.margin),
                (b.limit = i.limit),
                (b.padding = i.padding),
                b.pips ? R(b.pips) : F(),
                b.tooltips ? H() : z(),
                (S = []),
                ot(e.start || r, t);
            },
            target: h,
            removePips: F,
            removeTooltips: z,
            getTooltips: function () {
              return i;
            },
            getOrigins: function () {
              return u;
            },
            pips: R,
          })
        );
      }
      return {
        __spectrum: i,
        version: lt,
        cssClasses: d,
        create: function (t, e) {
          if (!t || !t.nodeName)
            throw new Error(
              'noUiSlider (' + lt + '): create requires a single element, got: ' + t,
            );
          if (t.noUiSlider)
            throw new Error('noUiSlider (' + lt + '): Slider was already initialized.');
          var r = j(t, vt(e), e);
          return (t.noUiSlider = r);
        },
      };
    });
    });

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-materialify\dist\components\List\List.svelte generated by Svelte v3.29.4 */
    const file$2 = "node_modules\\svelte-materialify\\dist\\components\\List\\List.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "role", /*role*/ ctx[8]);
    			attr_dev(div, "class", div_class_value = "s-list " + /*klass*/ ctx[0]);
    			attr_dev(div, "aria-disabled", /*disabled*/ ctx[2]);
    			attr_dev(div, "style", /*style*/ ctx[7]);
    			toggle_class(div, "dense", /*dense*/ ctx[1]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(div, "flat", /*flat*/ ctx[3]);
    			toggle_class(div, "nav", /*nav*/ ctx[5]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(div, "rounded", /*rounded*/ ctx[4]);
    			add_location(div, file$2, 22, 0, 1645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*role*/ 256) {
    				attr_dev(div, "role", /*role*/ ctx[8]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-list " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				attr_dev(div, "aria-disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div, "style", /*style*/ ctx[7]);
    			}

    			if (dirty & /*klass, dense*/ 3) {
    				toggle_class(div, "dense", /*dense*/ ctx[1]);
    			}

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(div, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, nav*/ 33) {
    				toggle_class(div, "nav", /*nav*/ ctx[5]);
    			}

    			if (dirty & /*klass, outlined*/ 65) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty & /*klass, rounded*/ 17) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { dense = null } = $$props;
    	let { disabled = null } = $$props;
    	let { flat = false } = $$props;
    	let { rounded = false } = $$props;
    	let { nav = false } = $$props;
    	let { outlined = false } = $$props;
    	let { style = null } = $$props;
    	let role = null;

    	if (!getContext("S_ListItemRole")) {
    		setContext("S_ListItemRole", "listitem");
    		role = "list";
    	}

    	const writable_props = ["class", "dense", "disabled", "flat", "rounded", "nav", "outlined", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("nav" in $$props) $$invalidate(5, nav = $$props.nav);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		klass,
    		dense,
    		disabled,
    		flat,
    		rounded,
    		nav,
    		outlined,
    		style,
    		role
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("nav" in $$props) $$invalidate(5, nav = $$props.nav);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("role" in $$props) $$invalidate(8, role = $$props.role);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		dense,
    		disabled,
    		flat,
    		rounded,
    		nav,
    		outlined,
    		style,
    		role,
    		$$scope,
    		slots
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			dense: 1,
    			disabled: 2,
    			flat: 3,
    			rounded: 4,
    			nav: 5,
    			outlined: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nav() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nav(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItem.svelte generated by Svelte v3.29.4 */
    const file$3 = "node_modules\\svelte-materialify\\dist\\components\\List\\ListItem.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    function create_fragment$3(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let div3_aria_selected_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[14].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[13], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const subtitle_slot_template = /*#slots*/ ctx[14].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[13], get_subtitle_slot_context);
    	const append_slot_template = /*#slots*/ ctx[14].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[13], get_append_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (subtitle_slot) subtitle_slot.c();
    			t2 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(div0, "class", "s-list-item__title");
    			add_location(div0, file$3, 56, 4, 4907);
    			attr_dev(div1, "class", "s-list-item__subtitle");
    			add_location(div1, file$3, 59, 4, 4970);
    			attr_dev(div2, "class", "s-list-item__content");
    			add_location(div2, file$3, 55, 2, 4868);
    			attr_dev(div3, "class", div3_class_value = "s-list-item " + /*klass*/ ctx[1]);
    			attr_dev(div3, "role", /*role*/ ctx[10]);
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1);
    			attr_dev(div3, "aria-selected", div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			toggle_class(div3, "link", /*link*/ ctx[6]);
    			toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			add_location(div3, file$3, 39, 0, 4535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (subtitle_slot) {
    				subtitle_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_slot) {
    				append_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, div3, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]])),
    					action_destroyer(Ripple_action = Ripple.call(null, div3, /*ripple*/ ctx[8])),
    					listen_dev(div3, "click", /*click*/ ctx[11], false, false, false),
    					listen_dev(div3, "click", /*click_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(subtitle_slot, subtitle_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_subtitle_slot_changes, get_subtitle_slot_context);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 2 && div3_class_value !== (div3_class_value = "s-list-item " + /*klass*/ ctx[1])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*link*/ 64 && div3_tabindex_value !== (div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div3_aria_selected_value !== (div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null)) {
    				attr_dev(div3, "aria-selected", div3_aria_selected_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 5) Class_action.update.call(null, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 256) Ripple_action.update.call(null, /*ripple*/ ctx[8]);

    			if (dirty & /*klass, dense*/ 10) {
    				toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 18) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*klass, multiline*/ 34) {
    				toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			}

    			if (dirty & /*klass, link*/ 66) {
    				toggle_class(div3, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, selectable*/ 130) {
    				toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(subtitle_slot, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(subtitle_slot, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['prepend','default','subtitle','append']);
    	const role = getContext("S_ListItemRole");
    	const ITEM_GROUP = getContext("S_ListItemGroup");

    	const DEFAULTS = {
    		select: () => null,
    		register: () => null,
    		index: () => null,
    		activeClass: "active"
    	};

    	const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS;
    	let { class: klass = "" } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { active = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = null } = $$props;
    	let { multiline = false } = $$props;
    	let { link = role } = $$props;
    	let { selectable = !link } = $$props;
    	let { ripple = getContext("S_ListItemRipple") || role || false } = $$props;
    	let { style = null } = $$props;

    	ITEM.register(values => {
    		$$invalidate(0, active = values.includes(value));
    	});

    	function click() {
    		if (!disabled) ITEM.select(value);
    	}

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"active",
    		"dense",
    		"disabled",
    		"multiline",
    		"link",
    		"selectable",
    		"ripple",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Ripple,
    		Class,
    		role,
    		ITEM_GROUP,
    		DEFAULTS,
    		ITEM,
    		klass,
    		activeClass,
    		value,
    		active,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		activeClass,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		role,
    		click,
    		value,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 1,
    			activeClass: 2,
    			value: 12,
    			active: 0,
    			dense: 3,
    			disabled: 4,
    			multiline: 5,
    			link: 6,
    			selectable: 7,
    			ripple: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\ProgressCircular\ProgressCircular.svelte generated by Svelte v3.29.4 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\ProgressCircular\\ProgressCircular.svelte";

    // (48:4) {#if !indeterminate}
    function create_if_block(ctx) {
    	let circle;
    	let circle_levels = [{ class: "underlay" }, /*circleProps*/ ctx[9], { "stroke-dashoffset": "0" }];
    	let circle_data = {};

    	for (let i = 0; i < circle_levels.length; i += 1) {
    		circle_data = assign(circle_data, circle_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			set_svg_attributes(circle, circle_data);
    			toggle_class(circle, "svelte-1i82uhg", true);
    			add_location(circle, file$4, 48, 6, 2251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_svg_attributes(circle, circle_data = get_spread_update(circle_levels, [
    				{ class: "underlay" },
    				/*circleProps*/ ctx[9],
    				{ "stroke-dashoffset": "0" }
    			]));

    			toggle_class(circle, "svelte-1i82uhg", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:4) {#if !indeterminate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let svg;
    	let circle;
    	let svg_viewBox_value;
    	let t;
    	let div0;
    	let div1_class_value;
    	let div1_style_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*indeterminate*/ ctx[1] && create_if_block(ctx);

    	let circle_levels = [
    		{ class: "overlay" },
    		/*circleProps*/ ctx[9],
    		{
    			"stroke-dashoffset": /*strokeDashOffset*/ ctx[8]
    		}
    	];

    	let circle_data = {};

    	for (let i = 0; i < circle_levels.length; i += 1) {
    		circle_data = assign(circle_data, circle_levels[i]);
    	}

    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			circle = svg_element("circle");
    			t = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			set_svg_attributes(circle, circle_data);
    			toggle_class(circle, "svelte-1i82uhg", true);
    			add_location(circle, file$4, 51, 4, 2333);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "" + (/*viewBoxSize*/ ctx[7] + "\n    " + /*viewBoxSize*/ ctx[7] + "\n    " + 2 * /*viewBoxSize*/ ctx[7] + "\n    " + 2 * /*viewBoxSize*/ ctx[7]));
    			set_style(svg, "transform", "rotate(" + /*rotate*/ ctx[3] + "deg)");
    			attr_dev(svg, "class", "svelte-1i82uhg");
    			add_location(svg, file$4, 40, 2, 2042);
    			attr_dev(div0, "class", "s-progress-circular__content svelte-1i82uhg");
    			add_location(div0, file$4, 54, 2, 2426);
    			attr_dev(div1, "role", "progressbar");
    			attr_dev(div1, "aria-valuemin", "0");
    			attr_dev(div1, "aria-valuemax", "100");
    			attr_dev(div1, "aria-valuenow", /*value*/ ctx[5]);
    			attr_dev(div1, "class", div1_class_value = "s-progress-circular " + /*klass*/ ctx[0] + " svelte-1i82uhg");
    			attr_dev(div1, "style", div1_style_value = "width:" + /*size*/ ctx[4] + "px;height:" + /*size*/ ctx[4] + "px;" + /*style*/ ctx[6]);
    			toggle_class(div1, "indeterminate", /*indeterminate*/ ctx[1]);
    			add_location(div1, file$4, 31, 0, 1814);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, circle);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div1, /*color*/ ctx[2]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*indeterminate*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(svg, circle);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(circle, circle_data = get_spread_update(circle_levels, [
    				{ class: "overlay" },
    				/*circleProps*/ ctx[9],
    				{
    					"stroke-dashoffset": /*strokeDashOffset*/ ctx[8]
    				}
    			]));

    			toggle_class(circle, "svelte-1i82uhg", true);

    			if (!current || dirty & /*rotate*/ 8) {
    				set_style(svg, "transform", "rotate(" + /*rotate*/ ctx[3] + "deg)");
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*value*/ 32) {
    				attr_dev(div1, "aria-valuenow", /*value*/ ctx[5]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div1_class_value !== (div1_class_value = "s-progress-circular " + /*klass*/ ctx[0] + " svelte-1i82uhg")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*size, style*/ 80 && div1_style_value !== (div1_style_value = "width:" + /*size*/ ctx[4] + "px;height:" + /*size*/ ctx[4] + "px;" + /*style*/ ctx[6])) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*color*/ 4) TextColor_action.update.call(null, /*color*/ ctx[2]);

    			if (dirty & /*klass, indeterminate*/ 3) {
    				toggle_class(div1, "indeterminate", /*indeterminate*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const radius = 20;

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressCircular", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { indeterminate = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { size = 32 } = $$props;
    	let { value = 0 } = $$props;
    	let { width = 4 } = $$props;
    	let { style = "" } = $$props;
    	const circumference = 2 * 3.1416 * radius;
    	const viewBoxSize = radius / (1 - Number(width) / +size);
    	const strokeWidth = Number(width) / +size * viewBoxSize * 2;
    	const strokeDashOffset = (100 - value) / 100 * circumference;

    	const circleProps = {
    		fill: "transparent",
    		cx: 2 * viewBoxSize,
    		cy: 2 * viewBoxSize,
    		r: radius,
    		"stroke-width": strokeWidth,
    		"stroke-dasharray": circumference
    	};

    	const writable_props = ["class", "indeterminate", "color", "rotate", "size", "value", "width", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressCircular> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("rotate" in $$props) $$invalidate(3, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("width" in $$props) $$invalidate(10, width = $$props.width);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		indeterminate,
    		color,
    		rotate,
    		size,
    		value,
    		width,
    		style,
    		radius,
    		circumference,
    		viewBoxSize,
    		strokeWidth,
    		strokeDashOffset,
    		circleProps
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("rotate" in $$props) $$invalidate(3, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("width" in $$props) $$invalidate(10, width = $$props.width);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		indeterminate,
    		color,
    		rotate,
    		size,
    		value,
    		style,
    		viewBoxSize,
    		strokeDashOffset,
    		circleProps,
    		width,
    		$$scope,
    		slots
    	];
    }

    class ProgressCircular extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 0,
    			indeterminate: 1,
    			color: 2,
    			rotate: 3,
    			size: 4,
    			value: 5,
    			width: 10,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressCircular",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\NavigationDrawer\NavigationDrawer.svelte generated by Svelte v3.29.4 */
    const file$5 = "node_modules\\svelte-materialify\\dist\\components\\NavigationDrawer\\NavigationDrawer.svelte";
    const get_append_slot_changes$1 = dirty => ({});
    const get_append_slot_context$1 = ctx => ({});
    const get_prepend_slot_changes$1 = dirty => ({});
    const get_prepend_slot_context$1 = ctx => ({});

    // (41:2) {#if !borderless}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "s-navigation-drawer__border");
    			add_location(div, file$5, 41, 4, 2566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:2) {#if !borderless}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let aside;
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let aside_class_value;
    	let Style_action;
    	let aside_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[15].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[14], get_prepend_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	const append_slot_template = /*#slots*/ ctx[15].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[14], get_append_slot_context$1);
    	let if_block = !/*borderless*/ ctx[8] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (append_slot) append_slot.c();
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "s-navigation-drawer__content");
    			add_location(div, file$5, 36, 2, 2452);
    			attr_dev(aside, "class", aside_class_value = "s-navigation-drawer " + /*klass*/ ctx[0]);
    			attr_dev(aside, "style", /*style*/ ctx[13]);
    			toggle_class(aside, "active", /*active*/ ctx[2]);
    			toggle_class(aside, "fixed", /*fixed*/ ctx[3]);
    			toggle_class(aside, "absolute", /*absolute*/ ctx[4]);
    			toggle_class(aside, "right", /*right*/ ctx[5]);
    			toggle_class(aside, "mini", /*mini*/ ctx[6]);
    			toggle_class(aside, "clipped", /*clipped*/ ctx[7]);
    			add_location(aside, file$5, 23, 0, 2125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(aside, null);
    			}

    			append_dev(aside, t0);
    			append_dev(aside, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(aside, t1);

    			if (append_slot) {
    				append_slot.m(aside, null);
    			}

    			append_dev(aside, t2);
    			if (if_block) if_block.m(aside, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(aside, "hover", /*hover_handler*/ ctx[16], false, false, false),
    					action_destroyer(Style_action = Style.call(null, aside, {
    						"nav-width": /*width*/ ctx[1],
    						"nav-min-width": /*miniWidth*/ ctx[9],
    						"nav-clipped-height": /*clippedHeight*/ ctx[10]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_prepend_slot_changes$1, get_prepend_slot_context$1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_append_slot_changes$1, get_append_slot_context$1);
    				}
    			}

    			if (!/*borderless*/ ctx[8]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(aside, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*klass*/ 1 && aside_class_value !== (aside_class_value = "s-navigation-drawer " + /*klass*/ ctx[0])) {
    				attr_dev(aside, "class", aside_class_value);
    			}

    			if (!current || dirty & /*style*/ 8192) {
    				attr_dev(aside, "style", /*style*/ ctx[13]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*width, miniWidth, clippedHeight*/ 1538) Style_action.update.call(null, {
    				"nav-width": /*width*/ ctx[1],
    				"nav-min-width": /*miniWidth*/ ctx[9],
    				"nav-clipped-height": /*clippedHeight*/ ctx[10]
    			});

    			if (dirty & /*klass, active*/ 5) {
    				toggle_class(aside, "active", /*active*/ ctx[2]);
    			}

    			if (dirty & /*klass, fixed*/ 9) {
    				toggle_class(aside, "fixed", /*fixed*/ ctx[3]);
    			}

    			if (dirty & /*klass, absolute*/ 17) {
    				toggle_class(aside, "absolute", /*absolute*/ ctx[4]);
    			}

    			if (dirty & /*klass, right*/ 33) {
    				toggle_class(aside, "right", /*right*/ ctx[5]);
    			}

    			if (dirty & /*klass, mini*/ 65) {
    				toggle_class(aside, "mini", /*mini*/ ctx[6]);
    			}

    			if (dirty & /*klass, clipped*/ 129) {
    				toggle_class(aside, "clipped", /*clipped*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(append_slot, local);

    			add_render_callback(() => {
    				if (!aside_transition) aside_transition = create_bidirectional_transition(aside, /*transition*/ ctx[11], /*transitionOpts*/ ctx[12], true);
    				aside_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(append_slot, local);
    			if (!aside_transition) aside_transition = create_bidirectional_transition(aside, /*transition*/ ctx[11], /*transitionOpts*/ ctx[12], false);
    			aside_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && aside_transition) aside_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavigationDrawer", slots, ['prepend','default','append']);
    	let { class: klass = "" } = $$props;
    	let { width = "256px" } = $$props;
    	let { active = true } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { right = false } = $$props;
    	let { mini = false } = $$props;
    	let { clipped = false } = $$props;
    	let { borderless = false } = $$props;
    	let { miniWidth = "56px" } = $$props;
    	let { clippedHeight = "56px" } = $$props;
    	let { transition = fade } = $$props;
    	let { transitionOpts = {} } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"width",
    		"active",
    		"fixed",
    		"absolute",
    		"right",
    		"mini",
    		"clipped",
    		"borderless",
    		"miniWidth",
    		"clippedHeight",
    		"transition",
    		"transitionOpts",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationDrawer> was created with unknown prop '${key}'`);
    	});

    	function hover_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("fixed" in $$props) $$invalidate(3, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(4, absolute = $$props.absolute);
    		if ("right" in $$props) $$invalidate(5, right = $$props.right);
    		if ("mini" in $$props) $$invalidate(6, mini = $$props.mini);
    		if ("clipped" in $$props) $$invalidate(7, clipped = $$props.clipped);
    		if ("borderless" in $$props) $$invalidate(8, borderless = $$props.borderless);
    		if ("miniWidth" in $$props) $$invalidate(9, miniWidth = $$props.miniWidth);
    		if ("clippedHeight" in $$props) $$invalidate(10, clippedHeight = $$props.clippedHeight);
    		if ("transition" in $$props) $$invalidate(11, transition = $$props.transition);
    		if ("transitionOpts" in $$props) $$invalidate(12, transitionOpts = $$props.transitionOpts);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Style,
    		klass,
    		width,
    		active,
    		fixed,
    		absolute,
    		right,
    		mini,
    		clipped,
    		borderless,
    		miniWidth,
    		clippedHeight,
    		transition,
    		transitionOpts,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("fixed" in $$props) $$invalidate(3, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(4, absolute = $$props.absolute);
    		if ("right" in $$props) $$invalidate(5, right = $$props.right);
    		if ("mini" in $$props) $$invalidate(6, mini = $$props.mini);
    		if ("clipped" in $$props) $$invalidate(7, clipped = $$props.clipped);
    		if ("borderless" in $$props) $$invalidate(8, borderless = $$props.borderless);
    		if ("miniWidth" in $$props) $$invalidate(9, miniWidth = $$props.miniWidth);
    		if ("clippedHeight" in $$props) $$invalidate(10, clippedHeight = $$props.clippedHeight);
    		if ("transition" in $$props) $$invalidate(11, transition = $$props.transition);
    		if ("transitionOpts" in $$props) $$invalidate(12, transitionOpts = $$props.transitionOpts);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		width,
    		active,
    		fixed,
    		absolute,
    		right,
    		mini,
    		clipped,
    		borderless,
    		miniWidth,
    		clippedHeight,
    		transition,
    		transitionOpts,
    		style,
    		$$scope,
    		slots,
    		hover_handler
    	];
    }

    class NavigationDrawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			width: 1,
    			active: 2,
    			fixed: 3,
    			absolute: 4,
    			right: 5,
    			mini: 6,
    			clipped: 7,
    			borderless: 8,
    			miniWidth: 9,
    			clippedHeight: 10,
    			transition: 11,
    			transitionOpts: 12,
    			style: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationDrawer",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mini() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mini(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clipped() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clipped(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get miniWidth() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set miniWidth(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clippedHeight() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clippedHeight(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOpts() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOpts(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix) {
    				if (typeof prefix == "string" && path.startsWith(prefix)) {
    					path = path.substr(prefix.length) || "/";
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var jquery = createCommonjsModule(function (module) {
    /*!
     * jQuery JavaScript Library v3.5.1
     * https://jquery.com/
     *
     * Includes Sizzle.js
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://jquery.org/license
     *
     * Date: 2020-05-04T22:49Z
     */
    ( function( global, factory ) {

    	{

    		// For CommonJS and CommonJS-like environments where a proper `window`
    		// is present, execute the factory and get jQuery.
    		// For environments that do not have a `window` with a `document`
    		// (such as Node.js), expose a factory as module.exports.
    		// This accentuates the need for the creation of a real `window`.
    		// e.g. var jQuery = require("jquery")(window);
    		// See ticket #14549 for more info.
    		module.exports = global.document ?
    			factory( global, true ) :
    			function( w ) {
    				if ( !w.document ) {
    					throw new Error( "jQuery requires a window with a document" );
    				}
    				return factory( w );
    			};
    	}

    // Pass this if window is not defined yet
    } )( typeof window !== "undefined" ? window : commonjsGlobal, function( window, noGlobal ) {

    var arr = [];

    var getProto = Object.getPrototypeOf;

    var slice = arr.slice;

    var flat = arr.flat ? function( array ) {
    	return arr.flat.call( array );
    } : function( array ) {
    	return arr.concat.apply( [], array );
    };


    var push = arr.push;

    var indexOf = arr.indexOf;

    var class2type = {};

    var toString = class2type.toString;

    var hasOwn = class2type.hasOwnProperty;

    var fnToString = hasOwn.toString;

    var ObjectFunctionString = fnToString.call( Object );

    var support = {};

    var isFunction = function isFunction( obj ) {

          // Support: Chrome <=57, Firefox <=52
          // In some browsers, typeof returns "function" for HTML <object> elements
          // (i.e., `typeof document.createElement( "object" ) === "function"`).
          // We don't want to classify *any* DOM node as a function.
          return typeof obj === "function" && typeof obj.nodeType !== "number";
      };


    var isWindow = function isWindow( obj ) {
    		return obj != null && obj === obj.window;
    	};


    var document = window.document;



    	var preservedScriptAttributes = {
    		type: true,
    		src: true,
    		nonce: true,
    		noModule: true
    	};

    	function DOMEval( code, node, doc ) {
    		doc = doc || document;

    		var i, val,
    			script = doc.createElement( "script" );

    		script.text = code;
    		if ( node ) {
    			for ( i in preservedScriptAttributes ) {

    				// Support: Firefox 64+, Edge 18+
    				// Some browsers don't support the "nonce" property on scripts.
    				// On the other hand, just using `getAttribute` is not enough as
    				// the `nonce` attribute is reset to an empty string whenever it
    				// becomes browsing-context connected.
    				// See https://github.com/whatwg/html/issues/2369
    				// See https://html.spec.whatwg.org/#nonce-attributes
    				// The `node.getAttribute` check was added for the sake of
    				// `jQuery.globalEval` so that it can fake a nonce-containing node
    				// via an object.
    				val = node[ i ] || node.getAttribute && node.getAttribute( i );
    				if ( val ) {
    					script.setAttribute( i, val );
    				}
    			}
    		}
    		doc.head.appendChild( script ).parentNode.removeChild( script );
    	}


    function toType( obj ) {
    	if ( obj == null ) {
    		return obj + "";
    	}

    	// Support: Android <=2.3 only (functionish RegExp)
    	return typeof obj === "object" || typeof obj === "function" ?
    		class2type[ toString.call( obj ) ] || "object" :
    		typeof obj;
    }
    /* global Symbol */
    // Defining this global in .eslintrc.json would create a danger of using the global
    // unguarded in another place, it seems safer to define global only for this module



    var
    	version = "3.5.1",

    	// Define a local copy of jQuery
    	jQuery = function( selector, context ) {

    		// The jQuery object is actually just the init constructor 'enhanced'
    		// Need init if jQuery is called (just allow error to be thrown if not included)
    		return new jQuery.fn.init( selector, context );
    	};

    jQuery.fn = jQuery.prototype = {

    	// The current version of jQuery being used
    	jquery: version,

    	constructor: jQuery,

    	// The default length of a jQuery object is 0
    	length: 0,

    	toArray: function() {
    		return slice.call( this );
    	},

    	// Get the Nth element in the matched element set OR
    	// Get the whole matched element set as a clean array
    	get: function( num ) {

    		// Return all the elements in a clean array
    		if ( num == null ) {
    			return slice.call( this );
    		}

    		// Return just the one element from the set
    		return num < 0 ? this[ num + this.length ] : this[ num ];
    	},

    	// Take an array of elements and push it onto the stack
    	// (returning the new matched element set)
    	pushStack: function( elems ) {

    		// Build a new jQuery matched element set
    		var ret = jQuery.merge( this.constructor(), elems );

    		// Add the old object onto the stack (as a reference)
    		ret.prevObject = this;

    		// Return the newly-formed element set
    		return ret;
    	},

    	// Execute a callback for every element in the matched set.
    	each: function( callback ) {
    		return jQuery.each( this, callback );
    	},

    	map: function( callback ) {
    		return this.pushStack( jQuery.map( this, function( elem, i ) {
    			return callback.call( elem, i, elem );
    		} ) );
    	},

    	slice: function() {
    		return this.pushStack( slice.apply( this, arguments ) );
    	},

    	first: function() {
    		return this.eq( 0 );
    	},

    	last: function() {
    		return this.eq( -1 );
    	},

    	even: function() {
    		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
    			return ( i + 1 ) % 2;
    		} ) );
    	},

    	odd: function() {
    		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
    			return i % 2;
    		} ) );
    	},

    	eq: function( i ) {
    		var len = this.length,
    			j = +i + ( i < 0 ? len : 0 );
    		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
    	},

    	end: function() {
    		return this.prevObject || this.constructor();
    	},

    	// For internal use only.
    	// Behaves like an Array's method, not like a jQuery method.
    	push: push,
    	sort: arr.sort,
    	splice: arr.splice
    };

    jQuery.extend = jQuery.fn.extend = function() {
    	var options, name, src, copy, copyIsArray, clone,
    		target = arguments[ 0 ] || {},
    		i = 1,
    		length = arguments.length,
    		deep = false;

    	// Handle a deep copy situation
    	if ( typeof target === "boolean" ) {
    		deep = target;

    		// Skip the boolean and the target
    		target = arguments[ i ] || {};
    		i++;
    	}

    	// Handle case when target is a string or something (possible in deep copy)
    	if ( typeof target !== "object" && !isFunction( target ) ) {
    		target = {};
    	}

    	// Extend jQuery itself if only one argument is passed
    	if ( i === length ) {
    		target = this;
    		i--;
    	}

    	for ( ; i < length; i++ ) {

    		// Only deal with non-null/undefined values
    		if ( ( options = arguments[ i ] ) != null ) {

    			// Extend the base object
    			for ( name in options ) {
    				copy = options[ name ];

    				// Prevent Object.prototype pollution
    				// Prevent never-ending loop
    				if ( name === "__proto__" || target === copy ) {
    					continue;
    				}

    				// Recurse if we're merging plain objects or arrays
    				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
    					( copyIsArray = Array.isArray( copy ) ) ) ) {
    					src = target[ name ];

    					// Ensure proper type for the source value
    					if ( copyIsArray && !Array.isArray( src ) ) {
    						clone = [];
    					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
    						clone = {};
    					} else {
    						clone = src;
    					}
    					copyIsArray = false;

    					// Never move original objects, clone them
    					target[ name ] = jQuery.extend( deep, clone, copy );

    				// Don't bring in undefined values
    				} else if ( copy !== undefined ) {
    					target[ name ] = copy;
    				}
    			}
    		}
    	}

    	// Return the modified object
    	return target;
    };

    jQuery.extend( {

    	// Unique for each copy of jQuery on the page
    	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

    	// Assume jQuery is ready without the ready module
    	isReady: true,

    	error: function( msg ) {
    		throw new Error( msg );
    	},

    	noop: function() {},

    	isPlainObject: function( obj ) {
    		var proto, Ctor;

    		// Detect obvious negatives
    		// Use toString instead of jQuery.type to catch host objects
    		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
    			return false;
    		}

    		proto = getProto( obj );

    		// Objects with no prototype (e.g., `Object.create( null )`) are plain
    		if ( !proto ) {
    			return true;
    		}

    		// Objects with prototype are plain iff they were constructed by a global Object function
    		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
    	},

    	isEmptyObject: function( obj ) {
    		var name;

    		for ( name in obj ) {
    			return false;
    		}
    		return true;
    	},

    	// Evaluates a script in a provided context; falls back to the global one
    	// if not specified.
    	globalEval: function( code, options, doc ) {
    		DOMEval( code, { nonce: options && options.nonce }, doc );
    	},

    	each: function( obj, callback ) {
    		var length, i = 0;

    		if ( isArrayLike( obj ) ) {
    			length = obj.length;
    			for ( ; i < length; i++ ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		} else {
    			for ( i in obj ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		}

    		return obj;
    	},

    	// results is for internal usage only
    	makeArray: function( arr, results ) {
    		var ret = results || [];

    		if ( arr != null ) {
    			if ( isArrayLike( Object( arr ) ) ) {
    				jQuery.merge( ret,
    					typeof arr === "string" ?
    					[ arr ] : arr
    				);
    			} else {
    				push.call( ret, arr );
    			}
    		}

    		return ret;
    	},

    	inArray: function( elem, arr, i ) {
    		return arr == null ? -1 : indexOf.call( arr, elem, i );
    	},

    	// Support: Android <=4.0 only, PhantomJS 1 only
    	// push.apply(_, arraylike) throws on ancient WebKit
    	merge: function( first, second ) {
    		var len = +second.length,
    			j = 0,
    			i = first.length;

    		for ( ; j < len; j++ ) {
    			first[ i++ ] = second[ j ];
    		}

    		first.length = i;

    		return first;
    	},

    	grep: function( elems, callback, invert ) {
    		var callbackInverse,
    			matches = [],
    			i = 0,
    			length = elems.length,
    			callbackExpect = !invert;

    		// Go through the array, only saving the items
    		// that pass the validator function
    		for ( ; i < length; i++ ) {
    			callbackInverse = !callback( elems[ i ], i );
    			if ( callbackInverse !== callbackExpect ) {
    				matches.push( elems[ i ] );
    			}
    		}

    		return matches;
    	},

    	// arg is for internal usage only
    	map: function( elems, callback, arg ) {
    		var length, value,
    			i = 0,
    			ret = [];

    		// Go through the array, translating each of the items to their new values
    		if ( isArrayLike( elems ) ) {
    			length = elems.length;
    			for ( ; i < length; i++ ) {
    				value = callback( elems[ i ], i, arg );

    				if ( value != null ) {
    					ret.push( value );
    				}
    			}

    		// Go through every key on the object,
    		} else {
    			for ( i in elems ) {
    				value = callback( elems[ i ], i, arg );

    				if ( value != null ) {
    					ret.push( value );
    				}
    			}
    		}

    		// Flatten any nested arrays
    		return flat( ret );
    	},

    	// A global GUID counter for objects
    	guid: 1,

    	// jQuery.support is not used in Core but other projects attach their
    	// properties to it so it needs to exist.
    	support: support
    } );

    if ( typeof Symbol === "function" ) {
    	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
    }

    // Populate the class2type map
    jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
    function( _i, name ) {
    	class2type[ "[object " + name + "]" ] = name.toLowerCase();
    } );

    function isArrayLike( obj ) {

    	// Support: real iOS 8.2 only (not reproducible in simulator)
    	// `in` check used to prevent JIT error (gh-2145)
    	// hasOwn isn't used here due to false negatives
    	// regarding Nodelist length in IE
    	var length = !!obj && "length" in obj && obj.length,
    		type = toType( obj );

    	if ( isFunction( obj ) || isWindow( obj ) ) {
    		return false;
    	}

    	return type === "array" || length === 0 ||
    		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
    }
    var Sizzle =
    /*!
     * Sizzle CSS Selector Engine v2.3.5
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://js.foundation/
     *
     * Date: 2020-03-14
     */
    ( function( window ) {
    var i,
    	support,
    	Expr,
    	getText,
    	isXML,
    	tokenize,
    	compile,
    	select,
    	outermostContext,
    	sortInput,
    	hasDuplicate,

    	// Local document vars
    	setDocument,
    	document,
    	docElem,
    	documentIsHTML,
    	rbuggyQSA,
    	rbuggyMatches,
    	matches,
    	contains,

    	// Instance-specific data
    	expando = "sizzle" + 1 * new Date(),
    	preferredDoc = window.document,
    	dirruns = 0,
    	done = 0,
    	classCache = createCache(),
    	tokenCache = createCache(),
    	compilerCache = createCache(),
    	nonnativeSelectorCache = createCache(),
    	sortOrder = function( a, b ) {
    		if ( a === b ) {
    			hasDuplicate = true;
    		}
    		return 0;
    	},

    	// Instance methods
    	hasOwn = ( {} ).hasOwnProperty,
    	arr = [],
    	pop = arr.pop,
    	pushNative = arr.push,
    	push = arr.push,
    	slice = arr.slice,

    	// Use a stripped-down indexOf as it's faster than native
    	// https://jsperf.com/thor-indexof-vs-for/5
    	indexOf = function( list, elem ) {
    		var i = 0,
    			len = list.length;
    		for ( ; i < len; i++ ) {
    			if ( list[ i ] === elem ) {
    				return i;
    			}
    		}
    		return -1;
    	},

    	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
    		"ismap|loop|multiple|open|readonly|required|scoped",

    	// Regular expressions

    	// http://www.w3.org/TR/css3-selectors/#whitespace
    	whitespace = "[\\x20\\t\\r\\n\\f]",

    	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
    	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
    		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

    	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
    	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

    		// Operator (capture 2)
    		"*([*^$|!~]?=)" + whitespace +

    		// "Attribute values must be CSS identifiers [capture 5]
    		// or strings [capture 3 or capture 4]"
    		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
    		whitespace + "*\\]",

    	pseudos = ":(" + identifier + ")(?:\\((" +

    		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    		// 1. quoted (capture 3; capture 4 or capture 5)
    		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

    		// 2. simple (capture 6)
    		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

    		// 3. anything else (capture 2)
    		".*" +
    		")\\)|)",

    	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    	rwhitespace = new RegExp( whitespace + "+", "g" ),
    	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
    		whitespace + "+$", "g" ),

    	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
    	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
    		"*" ),
    	rdescend = new RegExp( whitespace + "|>" ),

    	rpseudo = new RegExp( pseudos ),
    	ridentifier = new RegExp( "^" + identifier + "$" ),

    	matchExpr = {
    		"ID": new RegExp( "^#(" + identifier + ")" ),
    		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
    		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
    		"ATTR": new RegExp( "^" + attributes ),
    		"PSEUDO": new RegExp( "^" + pseudos ),
    		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
    			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
    			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

    		// For use in libraries implementing .is()
    		// We use this for POS matching in `select`
    		"needsContext": new RegExp( "^" + whitespace +
    			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
    			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
    	},

    	rhtml = /HTML$/i,
    	rinputs = /^(?:input|select|textarea|button)$/i,
    	rheader = /^h\d$/i,

    	rnative = /^[^{]+\{\s*\[native \w/,

    	// Easily-parseable/retrievable ID or TAG or CLASS selectors
    	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    	rsibling = /[+~]/,

    	// CSS escapes
    	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
    	funescape = function( escape, nonHex ) {
    		var high = "0x" + escape.slice( 1 ) - 0x10000;

    		return nonHex ?

    			// Strip the backslash prefix from a non-hex escape sequence
    			nonHex :

    			// Replace a hexadecimal escape sequence with the encoded Unicode code point
    			// Support: IE <=11+
    			// For values outside the Basic Multilingual Plane (BMP), manually construct a
    			// surrogate pair
    			high < 0 ?
    				String.fromCharCode( high + 0x10000 ) :
    				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
    	},

    	// CSS string/identifier serialization
    	// https://drafts.csswg.org/cssom/#common-serializing-idioms
    	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
    	fcssescape = function( ch, asCodePoint ) {
    		if ( asCodePoint ) {

    			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
    			if ( ch === "\0" ) {
    				return "\uFFFD";
    			}

    			// Control characters and (dependent upon position) numbers get escaped as code points
    			return ch.slice( 0, -1 ) + "\\" +
    				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
    		}

    		// Other potentially-special ASCII characters get backslash-escaped
    		return "\\" + ch;
    	},

    	// Used for iframes
    	// See setDocument()
    	// Removing the function wrapper causes a "Permission Denied"
    	// error in IE
    	unloadHandler = function() {
    		setDocument();
    	},

    	inDisabledFieldset = addCombinator(
    		function( elem ) {
    			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
    		},
    		{ dir: "parentNode", next: "legend" }
    	);

    // Optimize for push.apply( _, NodeList )
    try {
    	push.apply(
    		( arr = slice.call( preferredDoc.childNodes ) ),
    		preferredDoc.childNodes
    	);

    	// Support: Android<4.0
    	// Detect silently failing push.apply
    	// eslint-disable-next-line no-unused-expressions
    	arr[ preferredDoc.childNodes.length ].nodeType;
    } catch ( e ) {
    	push = { apply: arr.length ?

    		// Leverage slice if possible
    		function( target, els ) {
    			pushNative.apply( target, slice.call( els ) );
    		} :

    		// Support: IE<9
    		// Otherwise append directly
    		function( target, els ) {
    			var j = target.length,
    				i = 0;

    			// Can't trust NodeList.length
    			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
    			target.length = j - 1;
    		}
    	};
    }

    function Sizzle( selector, context, results, seed ) {
    	var m, i, elem, nid, match, groups, newSelector,
    		newContext = context && context.ownerDocument,

    		// nodeType defaults to 9, since context defaults to document
    		nodeType = context ? context.nodeType : 9;

    	results = results || [];

    	// Return early from calls with invalid selector or context
    	if ( typeof selector !== "string" || !selector ||
    		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

    		return results;
    	}

    	// Try to shortcut find operations (as opposed to filters) in HTML documents
    	if ( !seed ) {
    		setDocument( context );
    		context = context || document;

    		if ( documentIsHTML ) {

    			// If the selector is sufficiently simple, try using a "get*By*" DOM method
    			// (excepting DocumentFragment context, where the methods don't exist)
    			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

    				// ID selector
    				if ( ( m = match[ 1 ] ) ) {

    					// Document context
    					if ( nodeType === 9 ) {
    						if ( ( elem = context.getElementById( m ) ) ) {

    							// Support: IE, Opera, Webkit
    							// TODO: identify versions
    							// getElementById can match elements by name instead of ID
    							if ( elem.id === m ) {
    								results.push( elem );
    								return results;
    							}
    						} else {
    							return results;
    						}

    					// Element context
    					} else {

    						// Support: IE, Opera, Webkit
    						// TODO: identify versions
    						// getElementById can match elements by name instead of ID
    						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
    							contains( context, elem ) &&
    							elem.id === m ) {

    							results.push( elem );
    							return results;
    						}
    					}

    				// Type selector
    				} else if ( match[ 2 ] ) {
    					push.apply( results, context.getElementsByTagName( selector ) );
    					return results;

    				// Class selector
    				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
    					context.getElementsByClassName ) {

    					push.apply( results, context.getElementsByClassName( m ) );
    					return results;
    				}
    			}

    			// Take advantage of querySelectorAll
    			if ( support.qsa &&
    				!nonnativeSelectorCache[ selector + " " ] &&
    				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

    				// Support: IE 8 only
    				// Exclude object elements
    				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

    				newSelector = selector;
    				newContext = context;

    				// qSA considers elements outside a scoping root when evaluating child or
    				// descendant combinators, which is not what we want.
    				// In such cases, we work around the behavior by prefixing every selector in the
    				// list with an ID selector referencing the scope context.
    				// The technique has to be used as well when a leading combinator is used
    				// as such selectors are not recognized by querySelectorAll.
    				// Thanks to Andrew Dupont for this technique.
    				if ( nodeType === 1 &&
    					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

    					// Expand context for sibling selectors
    					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
    						context;

    					// We can use :scope instead of the ID hack if the browser
    					// supports it & if we're not changing the context.
    					if ( newContext !== context || !support.scope ) {

    						// Capture the context ID, setting it first if necessary
    						if ( ( nid = context.getAttribute( "id" ) ) ) {
    							nid = nid.replace( rcssescape, fcssescape );
    						} else {
    							context.setAttribute( "id", ( nid = expando ) );
    						}
    					}

    					// Prefix every selector in the list
    					groups = tokenize( selector );
    					i = groups.length;
    					while ( i-- ) {
    						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
    							toSelector( groups[ i ] );
    					}
    					newSelector = groups.join( "," );
    				}

    				try {
    					push.apply( results,
    						newContext.querySelectorAll( newSelector )
    					);
    					return results;
    				} catch ( qsaError ) {
    					nonnativeSelectorCache( selector, true );
    				} finally {
    					if ( nid === expando ) {
    						context.removeAttribute( "id" );
    					}
    				}
    			}
    		}
    	}

    	// All others
    	return select( selector.replace( rtrim, "$1" ), context, results, seed );
    }

    /**
     * Create key-value caches of limited size
     * @returns {function(string, object)} Returns the Object data after storing it on itself with
     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     *	deleting the oldest entry
     */
    function createCache() {
    	var keys = [];

    	function cache( key, value ) {

    		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
    		if ( keys.push( key + " " ) > Expr.cacheLength ) {

    			// Only keep the most recent entries
    			delete cache[ keys.shift() ];
    		}
    		return ( cache[ key + " " ] = value );
    	}
    	return cache;
    }

    /**
     * Mark a function for special use by Sizzle
     * @param {Function} fn The function to mark
     */
    function markFunction( fn ) {
    	fn[ expando ] = true;
    	return fn;
    }

    /**
     * Support testing using an element
     * @param {Function} fn Passed the created element and returns a boolean result
     */
    function assert( fn ) {
    	var el = document.createElement( "fieldset" );

    	try {
    		return !!fn( el );
    	} catch ( e ) {
    		return false;
    	} finally {

    		// Remove from its parent by default
    		if ( el.parentNode ) {
    			el.parentNode.removeChild( el );
    		}

    		// release memory in IE
    		el = null;
    	}
    }

    /**
     * Adds the same handler for all of the specified attrs
     * @param {String} attrs Pipe-separated list of attributes
     * @param {Function} handler The method that will be applied
     */
    function addHandle( attrs, handler ) {
    	var arr = attrs.split( "|" ),
    		i = arr.length;

    	while ( i-- ) {
    		Expr.attrHandle[ arr[ i ] ] = handler;
    	}
    }

    /**
     * Checks document order of two siblings
     * @param {Element} a
     * @param {Element} b
     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */
    function siblingCheck( a, b ) {
    	var cur = b && a,
    		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
    			a.sourceIndex - b.sourceIndex;

    	// Use IE sourceIndex if available on both nodes
    	if ( diff ) {
    		return diff;
    	}

    	// Check if b follows a
    	if ( cur ) {
    		while ( ( cur = cur.nextSibling ) ) {
    			if ( cur === b ) {
    				return -1;
    			}
    		}
    	}

    	return a ? 1 : -1;
    }

    /**
     * Returns a function to use in pseudos for input types
     * @param {String} type
     */
    function createInputPseudo( type ) {
    	return function( elem ) {
    		var name = elem.nodeName.toLowerCase();
    		return name === "input" && elem.type === type;
    	};
    }

    /**
     * Returns a function to use in pseudos for buttons
     * @param {String} type
     */
    function createButtonPseudo( type ) {
    	return function( elem ) {
    		var name = elem.nodeName.toLowerCase();
    		return ( name === "input" || name === "button" ) && elem.type === type;
    	};
    }

    /**
     * Returns a function to use in pseudos for :enabled/:disabled
     * @param {Boolean} disabled true for :disabled; false for :enabled
     */
    function createDisabledPseudo( disabled ) {

    	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
    	return function( elem ) {

    		// Only certain elements can match :enabled or :disabled
    		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
    		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
    		if ( "form" in elem ) {

    			// Check for inherited disabledness on relevant non-disabled elements:
    			// * listed form-associated elements in a disabled fieldset
    			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
    			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
    			// * option elements in a disabled optgroup
    			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
    			// All such elements have a "form" property.
    			if ( elem.parentNode && elem.disabled === false ) {

    				// Option elements defer to a parent optgroup if present
    				if ( "label" in elem ) {
    					if ( "label" in elem.parentNode ) {
    						return elem.parentNode.disabled === disabled;
    					} else {
    						return elem.disabled === disabled;
    					}
    				}

    				// Support: IE 6 - 11
    				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
    				return elem.isDisabled === disabled ||

    					// Where there is no isDisabled, check manually
    					/* jshint -W018 */
    					elem.isDisabled !== !disabled &&
    					inDisabledFieldset( elem ) === disabled;
    			}

    			return elem.disabled === disabled;

    		// Try to winnow out elements that can't be disabled before trusting the disabled property.
    		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
    		// even exist on them, let alone have a boolean value.
    		} else if ( "label" in elem ) {
    			return elem.disabled === disabled;
    		}

    		// Remaining elements are neither :enabled nor :disabled
    		return false;
    	};
    }

    /**
     * Returns a function to use in pseudos for positionals
     * @param {Function} fn
     */
    function createPositionalPseudo( fn ) {
    	return markFunction( function( argument ) {
    		argument = +argument;
    		return markFunction( function( seed, matches ) {
    			var j,
    				matchIndexes = fn( [], seed.length, argument ),
    				i = matchIndexes.length;

    			// Match elements found at the specified indexes
    			while ( i-- ) {
    				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
    					seed[ j ] = !( matches[ j ] = seed[ j ] );
    				}
    			}
    		} );
    	} );
    }

    /**
     * Checks a node for validity as a Sizzle context
     * @param {Element|Object=} context
     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */
    function testContext( context ) {
    	return context && typeof context.getElementsByTagName !== "undefined" && context;
    }

    // Expose support vars for convenience
    support = Sizzle.support = {};

    /**
     * Detects XML nodes
     * @param {Element|Object} elem An element or a document
     * @returns {Boolean} True iff elem is a non-HTML XML node
     */
    isXML = Sizzle.isXML = function( elem ) {
    	var namespace = elem.namespaceURI,
    		docElem = ( elem.ownerDocument || elem ).documentElement;

    	// Support: IE <=8
    	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
    	// https://bugs.jquery.com/ticket/4833
    	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
    };

    /**
     * Sets document-related variables once based on the current document
     * @param {Element|Object} [doc] An element or document object to use to set the document
     * @returns {Object} Returns the current document
     */
    setDocument = Sizzle.setDocument = function( node ) {
    	var hasCompare, subWindow,
    		doc = node ? node.ownerDocument || node : preferredDoc;

    	// Return early if doc is invalid or already selected
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
    		return document;
    	}

    	// Update global variables
    	document = doc;
    	docElem = document.documentElement;
    	documentIsHTML = !isXML( document );

    	// Support: IE 9 - 11+, Edge 12 - 18+
    	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( preferredDoc != document &&
    		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

    		// Support: IE 11, Edge
    		if ( subWindow.addEventListener ) {
    			subWindow.addEventListener( "unload", unloadHandler, false );

    		// Support: IE 9 - 10 only
    		} else if ( subWindow.attachEvent ) {
    			subWindow.attachEvent( "onunload", unloadHandler );
    		}
    	}

    	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
    	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
    	// IE/Edge & older browsers don't support the :scope pseudo-class.
    	// Support: Safari 6.0 only
    	// Safari 6.0 supports :scope but it's an alias of :root there.
    	support.scope = assert( function( el ) {
    		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
    		return typeof el.querySelectorAll !== "undefined" &&
    			!el.querySelectorAll( ":scope fieldset div" ).length;
    	} );

    	/* Attributes
    	---------------------------------------------------------------------- */

    	// Support: IE<8
    	// Verify that getAttribute really returns attributes and not properties
    	// (excepting IE8 booleans)
    	support.attributes = assert( function( el ) {
    		el.className = "i";
    		return !el.getAttribute( "className" );
    	} );

    	/* getElement(s)By*
    	---------------------------------------------------------------------- */

    	// Check if getElementsByTagName("*") returns only elements
    	support.getElementsByTagName = assert( function( el ) {
    		el.appendChild( document.createComment( "" ) );
    		return !el.getElementsByTagName( "*" ).length;
    	} );

    	// Support: IE<9
    	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

    	// Support: IE<10
    	// Check if getElementById returns elements by name
    	// The broken getElementById methods don't pick up programmatically-set names,
    	// so use a roundabout getElementsByName test
    	support.getById = assert( function( el ) {
    		docElem.appendChild( el ).id = expando;
    		return !document.getElementsByName || !document.getElementsByName( expando ).length;
    	} );

    	// ID filter and find
    	if ( support.getById ) {
    		Expr.filter[ "ID" ] = function( id ) {
    			var attrId = id.replace( runescape, funescape );
    			return function( elem ) {
    				return elem.getAttribute( "id" ) === attrId;
    			};
    		};
    		Expr.find[ "ID" ] = function( id, context ) {
    			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
    				var elem = context.getElementById( id );
    				return elem ? [ elem ] : [];
    			}
    		};
    	} else {
    		Expr.filter[ "ID" ] =  function( id ) {
    			var attrId = id.replace( runescape, funescape );
    			return function( elem ) {
    				var node = typeof elem.getAttributeNode !== "undefined" &&
    					elem.getAttributeNode( "id" );
    				return node && node.value === attrId;
    			};
    		};

    		// Support: IE 6 - 7 only
    		// getElementById is not reliable as a find shortcut
    		Expr.find[ "ID" ] = function( id, context ) {
    			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
    				var node, i, elems,
    					elem = context.getElementById( id );

    				if ( elem ) {

    					// Verify the id attribute
    					node = elem.getAttributeNode( "id" );
    					if ( node && node.value === id ) {
    						return [ elem ];
    					}

    					// Fall back on getElementsByName
    					elems = context.getElementsByName( id );
    					i = 0;
    					while ( ( elem = elems[ i++ ] ) ) {
    						node = elem.getAttributeNode( "id" );
    						if ( node && node.value === id ) {
    							return [ elem ];
    						}
    					}
    				}

    				return [];
    			}
    		};
    	}

    	// Tag
    	Expr.find[ "TAG" ] = support.getElementsByTagName ?
    		function( tag, context ) {
    			if ( typeof context.getElementsByTagName !== "undefined" ) {
    				return context.getElementsByTagName( tag );

    			// DocumentFragment nodes don't have gEBTN
    			} else if ( support.qsa ) {
    				return context.querySelectorAll( tag );
    			}
    		} :

    		function( tag, context ) {
    			var elem,
    				tmp = [],
    				i = 0,

    				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
    				results = context.getElementsByTagName( tag );

    			// Filter out possible comments
    			if ( tag === "*" ) {
    				while ( ( elem = results[ i++ ] ) ) {
    					if ( elem.nodeType === 1 ) {
    						tmp.push( elem );
    					}
    				}

    				return tmp;
    			}
    			return results;
    		};

    	// Class
    	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
    		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
    			return context.getElementsByClassName( className );
    		}
    	};

    	/* QSA/matchesSelector
    	---------------------------------------------------------------------- */

    	// QSA and matchesSelector support

    	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
    	rbuggyMatches = [];

    	// qSa(:focus) reports false when true (Chrome 21)
    	// We allow this because of a bug in IE8/9 that throws an error
    	// whenever `document.activeElement` is accessed on an iframe
    	// So, we allow :focus to pass through QSA all the time to avoid the IE error
    	// See https://bugs.jquery.com/ticket/13378
    	rbuggyQSA = [];

    	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

    		// Build QSA regex
    		// Regex strategy adopted from Diego Perini
    		assert( function( el ) {

    			var input;

    			// Select is set to empty string on purpose
    			// This is to test IE's treatment of not explicitly
    			// setting a boolean content attribute,
    			// since its presence should be enough
    			// https://bugs.jquery.com/ticket/12359
    			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
    				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
    				"<option selected=''></option></select>";

    			// Support: IE8, Opera 11-12.16
    			// Nothing should be selected when empty strings follow ^= or $= or *=
    			// The test attribute must be unknown in Opera but "safe" for WinRT
    			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
    			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
    				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
    			}

    			// Support: IE8
    			// Boolean attributes and "value" are not treated correctly
    			if ( !el.querySelectorAll( "[selected]" ).length ) {
    				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
    			}

    			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
    			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
    				rbuggyQSA.push( "~=" );
    			}

    			// Support: IE 11+, Edge 15 - 18+
    			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
    			// Adding a temporary attribute to the document before the selection works
    			// around the issue.
    			// Interestingly, IE 10 & older don't seem to have the issue.
    			input = document.createElement( "input" );
    			input.setAttribute( "name", "" );
    			el.appendChild( input );
    			if ( !el.querySelectorAll( "[name='']" ).length ) {
    				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
    					whitespace + "*(?:''|\"\")" );
    			}

    			// Webkit/Opera - :checked should return selected option elements
    			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
    			// IE8 throws error here and will not see later tests
    			if ( !el.querySelectorAll( ":checked" ).length ) {
    				rbuggyQSA.push( ":checked" );
    			}

    			// Support: Safari 8+, iOS 8+
    			// https://bugs.webkit.org/show_bug.cgi?id=136851
    			// In-page `selector#id sibling-combinator selector` fails
    			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
    				rbuggyQSA.push( ".#.+[+~]" );
    			}

    			// Support: Firefox <=3.6 - 5 only
    			// Old Firefox doesn't throw on a badly-escaped identifier.
    			el.querySelectorAll( "\\\f" );
    			rbuggyQSA.push( "[\\r\\n\\f]" );
    		} );

    		assert( function( el ) {
    			el.innerHTML = "<a href='' disabled='disabled'></a>" +
    				"<select disabled='disabled'><option/></select>";

    			// Support: Windows 8 Native Apps
    			// The type and name attributes are restricted during .innerHTML assignment
    			var input = document.createElement( "input" );
    			input.setAttribute( "type", "hidden" );
    			el.appendChild( input ).setAttribute( "name", "D" );

    			// Support: IE8
    			// Enforce case-sensitivity of name attribute
    			if ( el.querySelectorAll( "[name=d]" ).length ) {
    				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
    			}

    			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
    			// IE8 throws error here and will not see later tests
    			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
    				rbuggyQSA.push( ":enabled", ":disabled" );
    			}

    			// Support: IE9-11+
    			// IE's :disabled selector does not pick up the children of disabled fieldsets
    			docElem.appendChild( el ).disabled = true;
    			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
    				rbuggyQSA.push( ":enabled", ":disabled" );
    			}

    			// Support: Opera 10 - 11 only
    			// Opera 10-11 does not throw on post-comma invalid pseudos
    			el.querySelectorAll( "*,:x" );
    			rbuggyQSA.push( ",.*:" );
    		} );
    	}

    	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
    		docElem.webkitMatchesSelector ||
    		docElem.mozMatchesSelector ||
    		docElem.oMatchesSelector ||
    		docElem.msMatchesSelector ) ) ) ) {

    		assert( function( el ) {

    			// Check to see if it's possible to do matchesSelector
    			// on a disconnected node (IE 9)
    			support.disconnectedMatch = matches.call( el, "*" );

    			// This should fail with an exception
    			// Gecko does not error, returns false instead
    			matches.call( el, "[s!='']:x" );
    			rbuggyMatches.push( "!=", pseudos );
    		} );
    	}

    	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
    	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

    	/* Contains
    	---------------------------------------------------------------------- */
    	hasCompare = rnative.test( docElem.compareDocumentPosition );

    	// Element contains another
    	// Purposefully self-exclusive
    	// As in, an element does not contain itself
    	contains = hasCompare || rnative.test( docElem.contains ) ?
    		function( a, b ) {
    			var adown = a.nodeType === 9 ? a.documentElement : a,
    				bup = b && b.parentNode;
    			return a === bup || !!( bup && bup.nodeType === 1 && (
    				adown.contains ?
    					adown.contains( bup ) :
    					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
    			) );
    		} :
    		function( a, b ) {
    			if ( b ) {
    				while ( ( b = b.parentNode ) ) {
    					if ( b === a ) {
    						return true;
    					}
    				}
    			}
    			return false;
    		};

    	/* Sorting
    	---------------------------------------------------------------------- */

    	// Document order sorting
    	sortOrder = hasCompare ?
    	function( a, b ) {

    		// Flag for duplicate removal
    		if ( a === b ) {
    			hasDuplicate = true;
    			return 0;
    		}

    		// Sort on method existence if only one input has compareDocumentPosition
    		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
    		if ( compare ) {
    			return compare;
    		}

    		// Calculate position if both inputs belong to the same document
    		// Support: IE 11+, Edge 17 - 18+
    		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    		// two documents; shallow comparisons work.
    		// eslint-disable-next-line eqeqeq
    		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
    			a.compareDocumentPosition( b ) :

    			// Otherwise we know they are disconnected
    			1;

    		// Disconnected nodes
    		if ( compare & 1 ||
    			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

    			// Choose the first element that is related to our preferred document
    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			// eslint-disable-next-line eqeqeq
    			if ( a == document || a.ownerDocument == preferredDoc &&
    				contains( preferredDoc, a ) ) {
    				return -1;
    			}

    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			// eslint-disable-next-line eqeqeq
    			if ( b == document || b.ownerDocument == preferredDoc &&
    				contains( preferredDoc, b ) ) {
    				return 1;
    			}

    			// Maintain original order
    			return sortInput ?
    				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
    				0;
    		}

    		return compare & 4 ? -1 : 1;
    	} :
    	function( a, b ) {

    		// Exit early if the nodes are identical
    		if ( a === b ) {
    			hasDuplicate = true;
    			return 0;
    		}

    		var cur,
    			i = 0,
    			aup = a.parentNode,
    			bup = b.parentNode,
    			ap = [ a ],
    			bp = [ b ];

    		// Parentless nodes are either documents or disconnected
    		if ( !aup || !bup ) {

    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			/* eslint-disable eqeqeq */
    			return a == document ? -1 :
    				b == document ? 1 :
    				/* eslint-enable eqeqeq */
    				aup ? -1 :
    				bup ? 1 :
    				sortInput ?
    				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
    				0;

    		// If the nodes are siblings, we can do a quick check
    		} else if ( aup === bup ) {
    			return siblingCheck( a, b );
    		}

    		// Otherwise we need full lists of their ancestors for comparison
    		cur = a;
    		while ( ( cur = cur.parentNode ) ) {
    			ap.unshift( cur );
    		}
    		cur = b;
    		while ( ( cur = cur.parentNode ) ) {
    			bp.unshift( cur );
    		}

    		// Walk down the tree looking for a discrepancy
    		while ( ap[ i ] === bp[ i ] ) {
    			i++;
    		}

    		return i ?

    			// Do a sibling check if the nodes have a common ancestor
    			siblingCheck( ap[ i ], bp[ i ] ) :

    			// Otherwise nodes in our document sort first
    			// Support: IE 11+, Edge 17 - 18+
    			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    			// two documents; shallow comparisons work.
    			/* eslint-disable eqeqeq */
    			ap[ i ] == preferredDoc ? -1 :
    			bp[ i ] == preferredDoc ? 1 :
    			/* eslint-enable eqeqeq */
    			0;
    	};

    	return document;
    };

    Sizzle.matches = function( expr, elements ) {
    	return Sizzle( expr, null, null, elements );
    };

    Sizzle.matchesSelector = function( elem, expr ) {
    	setDocument( elem );

    	if ( support.matchesSelector && documentIsHTML &&
    		!nonnativeSelectorCache[ expr + " " ] &&
    		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
    		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

    		try {
    			var ret = matches.call( elem, expr );

    			// IE 9's matchesSelector returns false on disconnected nodes
    			if ( ret || support.disconnectedMatch ||

    				// As well, disconnected nodes are said to be in a document
    				// fragment in IE 9
    				elem.document && elem.document.nodeType !== 11 ) {
    				return ret;
    			}
    		} catch ( e ) {
    			nonnativeSelectorCache( expr, true );
    		}
    	}

    	return Sizzle( expr, document, null, [ elem ] ).length > 0;
    };

    Sizzle.contains = function( context, elem ) {

    	// Set document vars if needed
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( ( context.ownerDocument || context ) != document ) {
    		setDocument( context );
    	}
    	return contains( context, elem );
    };

    Sizzle.attr = function( elem, name ) {

    	// Set document vars if needed
    	// Support: IE 11+, Edge 17 - 18+
    	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    	// two documents; shallow comparisons work.
    	// eslint-disable-next-line eqeqeq
    	if ( ( elem.ownerDocument || elem ) != document ) {
    		setDocument( elem );
    	}

    	var fn = Expr.attrHandle[ name.toLowerCase() ],

    		// Don't get fooled by Object.prototype properties (jQuery #13807)
    		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
    			fn( elem, name, !documentIsHTML ) :
    			undefined;

    	return val !== undefined ?
    		val :
    		support.attributes || !documentIsHTML ?
    			elem.getAttribute( name ) :
    			( val = elem.getAttributeNode( name ) ) && val.specified ?
    				val.value :
    				null;
    };

    Sizzle.escape = function( sel ) {
    	return ( sel + "" ).replace( rcssescape, fcssescape );
    };

    Sizzle.error = function( msg ) {
    	throw new Error( "Syntax error, unrecognized expression: " + msg );
    };

    /**
     * Document sorting and removing duplicates
     * @param {ArrayLike} results
     */
    Sizzle.uniqueSort = function( results ) {
    	var elem,
    		duplicates = [],
    		j = 0,
    		i = 0;

    	// Unless we *know* we can detect duplicates, assume their presence
    	hasDuplicate = !support.detectDuplicates;
    	sortInput = !support.sortStable && results.slice( 0 );
    	results.sort( sortOrder );

    	if ( hasDuplicate ) {
    		while ( ( elem = results[ i++ ] ) ) {
    			if ( elem === results[ i ] ) {
    				j = duplicates.push( i );
    			}
    		}
    		while ( j-- ) {
    			results.splice( duplicates[ j ], 1 );
    		}
    	}

    	// Clear input after sorting to release objects
    	// See https://github.com/jquery/sizzle/pull/225
    	sortInput = null;

    	return results;
    };

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function( elem ) {
    	var node,
    		ret = "",
    		i = 0,
    		nodeType = elem.nodeType;

    	if ( !nodeType ) {

    		// If no nodeType, this is expected to be an array
    		while ( ( node = elem[ i++ ] ) ) {

    			// Do not traverse comment nodes
    			ret += getText( node );
    		}
    	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

    		// Use textContent for elements
    		// innerText usage removed for consistency of new lines (jQuery #11153)
    		if ( typeof elem.textContent === "string" ) {
    			return elem.textContent;
    		} else {

    			// Traverse its children
    			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
    				ret += getText( elem );
    			}
    		}
    	} else if ( nodeType === 3 || nodeType === 4 ) {
    		return elem.nodeValue;
    	}

    	// Do not include comment or processing instruction nodes

    	return ret;
    };

    Expr = Sizzle.selectors = {

    	// Can be adjusted by the user
    	cacheLength: 50,

    	createPseudo: markFunction,

    	match: matchExpr,

    	attrHandle: {},

    	find: {},

    	relative: {
    		">": { dir: "parentNode", first: true },
    		" ": { dir: "parentNode" },
    		"+": { dir: "previousSibling", first: true },
    		"~": { dir: "previousSibling" }
    	},

    	preFilter: {
    		"ATTR": function( match ) {
    			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

    			// Move the given value to match[3] whether quoted or unquoted
    			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
    				match[ 5 ] || "" ).replace( runescape, funescape );

    			if ( match[ 2 ] === "~=" ) {
    				match[ 3 ] = " " + match[ 3 ] + " ";
    			}

    			return match.slice( 0, 4 );
    		},

    		"CHILD": function( match ) {

    			/* matches from matchExpr["CHILD"]
    				1 type (only|nth|...)
    				2 what (child|of-type)
    				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
    				4 xn-component of xn+y argument ([+-]?\d*n|)
    				5 sign of xn-component
    				6 x of xn-component
    				7 sign of y-component
    				8 y of y-component
    			*/
    			match[ 1 ] = match[ 1 ].toLowerCase();

    			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

    				// nth-* requires argument
    				if ( !match[ 3 ] ) {
    					Sizzle.error( match[ 0 ] );
    				}

    				// numeric x and y parameters for Expr.filter.CHILD
    				// remember that false/true cast respectively to 0/1
    				match[ 4 ] = +( match[ 4 ] ?
    					match[ 5 ] + ( match[ 6 ] || 1 ) :
    					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
    				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

    				// other types prohibit arguments
    			} else if ( match[ 3 ] ) {
    				Sizzle.error( match[ 0 ] );
    			}

    			return match;
    		},

    		"PSEUDO": function( match ) {
    			var excess,
    				unquoted = !match[ 6 ] && match[ 2 ];

    			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
    				return null;
    			}

    			// Accept quoted arguments as-is
    			if ( match[ 3 ] ) {
    				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

    			// Strip excess characters from unquoted arguments
    			} else if ( unquoted && rpseudo.test( unquoted ) &&

    				// Get excess from tokenize (recursively)
    				( excess = tokenize( unquoted, true ) ) &&

    				// advance to the next closing parenthesis
    				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

    				// excess is a negative index
    				match[ 0 ] = match[ 0 ].slice( 0, excess );
    				match[ 2 ] = unquoted.slice( 0, excess );
    			}

    			// Return only captures needed by the pseudo filter method (type and argument)
    			return match.slice( 0, 3 );
    		}
    	},

    	filter: {

    		"TAG": function( nodeNameSelector ) {
    			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
    			return nodeNameSelector === "*" ?
    				function() {
    					return true;
    				} :
    				function( elem ) {
    					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
    				};
    		},

    		"CLASS": function( className ) {
    			var pattern = classCache[ className + " " ];

    			return pattern ||
    				( pattern = new RegExp( "(^|" + whitespace +
    					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
    						className, function( elem ) {
    							return pattern.test(
    								typeof elem.className === "string" && elem.className ||
    								typeof elem.getAttribute !== "undefined" &&
    									elem.getAttribute( "class" ) ||
    								""
    							);
    				} );
    		},

    		"ATTR": function( name, operator, check ) {
    			return function( elem ) {
    				var result = Sizzle.attr( elem, name );

    				if ( result == null ) {
    					return operator === "!=";
    				}
    				if ( !operator ) {
    					return true;
    				}

    				result += "";

    				/* eslint-disable max-len */

    				return operator === "=" ? result === check :
    					operator === "!=" ? result !== check :
    					operator === "^=" ? check && result.indexOf( check ) === 0 :
    					operator === "*=" ? check && result.indexOf( check ) > -1 :
    					operator === "$=" ? check && result.slice( -check.length ) === check :
    					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
    					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
    					false;
    				/* eslint-enable max-len */

    			};
    		},

    		"CHILD": function( type, what, _argument, first, last ) {
    			var simple = type.slice( 0, 3 ) !== "nth",
    				forward = type.slice( -4 ) !== "last",
    				ofType = what === "of-type";

    			return first === 1 && last === 0 ?

    				// Shortcut for :nth-*(n)
    				function( elem ) {
    					return !!elem.parentNode;
    				} :

    				function( elem, _context, xml ) {
    					var cache, uniqueCache, outerCache, node, nodeIndex, start,
    						dir = simple !== forward ? "nextSibling" : "previousSibling",
    						parent = elem.parentNode,
    						name = ofType && elem.nodeName.toLowerCase(),
    						useCache = !xml && !ofType,
    						diff = false;

    					if ( parent ) {

    						// :(first|last|only)-(child|of-type)
    						if ( simple ) {
    							while ( dir ) {
    								node = elem;
    								while ( ( node = node[ dir ] ) ) {
    									if ( ofType ?
    										node.nodeName.toLowerCase() === name :
    										node.nodeType === 1 ) {

    										return false;
    									}
    								}

    								// Reverse direction for :only-* (if we haven't yet done so)
    								start = dir = type === "only" && !start && "nextSibling";
    							}
    							return true;
    						}

    						start = [ forward ? parent.firstChild : parent.lastChild ];

    						// non-xml :nth-child(...) stores cache data on `parent`
    						if ( forward && useCache ) {

    							// Seek `elem` from a previously-cached index

    							// ...in a gzip-friendly way
    							node = parent;
    							outerCache = node[ expando ] || ( node[ expando ] = {} );

    							// Support: IE <9 only
    							// Defend against cloned attroperties (jQuery gh-1709)
    							uniqueCache = outerCache[ node.uniqueID ] ||
    								( outerCache[ node.uniqueID ] = {} );

    							cache = uniqueCache[ type ] || [];
    							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
    							diff = nodeIndex && cache[ 2 ];
    							node = nodeIndex && parent.childNodes[ nodeIndex ];

    							while ( ( node = ++nodeIndex && node && node[ dir ] ||

    								// Fallback to seeking `elem` from the start
    								( diff = nodeIndex = 0 ) || start.pop() ) ) {

    								// When found, cache indexes on `parent` and break
    								if ( node.nodeType === 1 && ++diff && node === elem ) {
    									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
    									break;
    								}
    							}

    						} else {

    							// Use previously-cached element index if available
    							if ( useCache ) {

    								// ...in a gzip-friendly way
    								node = elem;
    								outerCache = node[ expando ] || ( node[ expando ] = {} );

    								// Support: IE <9 only
    								// Defend against cloned attroperties (jQuery gh-1709)
    								uniqueCache = outerCache[ node.uniqueID ] ||
    									( outerCache[ node.uniqueID ] = {} );

    								cache = uniqueCache[ type ] || [];
    								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
    								diff = nodeIndex;
    							}

    							// xml :nth-child(...)
    							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
    							if ( diff === false ) {

    								// Use the same loop as above to seek `elem` from the start
    								while ( ( node = ++nodeIndex && node && node[ dir ] ||
    									( diff = nodeIndex = 0 ) || start.pop() ) ) {

    									if ( ( ofType ?
    										node.nodeName.toLowerCase() === name :
    										node.nodeType === 1 ) &&
    										++diff ) {

    										// Cache the index of each encountered element
    										if ( useCache ) {
    											outerCache = node[ expando ] ||
    												( node[ expando ] = {} );

    											// Support: IE <9 only
    											// Defend against cloned attroperties (jQuery gh-1709)
    											uniqueCache = outerCache[ node.uniqueID ] ||
    												( outerCache[ node.uniqueID ] = {} );

    											uniqueCache[ type ] = [ dirruns, diff ];
    										}

    										if ( node === elem ) {
    											break;
    										}
    									}
    								}
    							}
    						}

    						// Incorporate the offset, then check against cycle size
    						diff -= last;
    						return diff === first || ( diff % first === 0 && diff / first >= 0 );
    					}
    				};
    		},

    		"PSEUDO": function( pseudo, argument ) {

    			// pseudo-class names are case-insensitive
    			// http://www.w3.org/TR/selectors/#pseudo-classes
    			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
    			// Remember that setFilters inherits from pseudos
    			var args,
    				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
    					Sizzle.error( "unsupported pseudo: " + pseudo );

    			// The user may use createPseudo to indicate that
    			// arguments are needed to create the filter function
    			// just as Sizzle does
    			if ( fn[ expando ] ) {
    				return fn( argument );
    			}

    			// But maintain support for old signatures
    			if ( fn.length > 1 ) {
    				args = [ pseudo, pseudo, "", argument ];
    				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
    					markFunction( function( seed, matches ) {
    						var idx,
    							matched = fn( seed, argument ),
    							i = matched.length;
    						while ( i-- ) {
    							idx = indexOf( seed, matched[ i ] );
    							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
    						}
    					} ) :
    					function( elem ) {
    						return fn( elem, 0, args );
    					};
    			}

    			return fn;
    		}
    	},

    	pseudos: {

    		// Potentially complex pseudos
    		"not": markFunction( function( selector ) {

    			// Trim the selector passed to compile
    			// to avoid treating leading and trailing
    			// spaces as combinators
    			var input = [],
    				results = [],
    				matcher = compile( selector.replace( rtrim, "$1" ) );

    			return matcher[ expando ] ?
    				markFunction( function( seed, matches, _context, xml ) {
    					var elem,
    						unmatched = matcher( seed, null, xml, [] ),
    						i = seed.length;

    					// Match elements unmatched by `matcher`
    					while ( i-- ) {
    						if ( ( elem = unmatched[ i ] ) ) {
    							seed[ i ] = !( matches[ i ] = elem );
    						}
    					}
    				} ) :
    				function( elem, _context, xml ) {
    					input[ 0 ] = elem;
    					matcher( input, null, xml, results );

    					// Don't keep the element (issue #299)
    					input[ 0 ] = null;
    					return !results.pop();
    				};
    		} ),

    		"has": markFunction( function( selector ) {
    			return function( elem ) {
    				return Sizzle( selector, elem ).length > 0;
    			};
    		} ),

    		"contains": markFunction( function( text ) {
    			text = text.replace( runescape, funescape );
    			return function( elem ) {
    				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
    			};
    		} ),

    		// "Whether an element is represented by a :lang() selector
    		// is based solely on the element's language value
    		// being equal to the identifier C,
    		// or beginning with the identifier C immediately followed by "-".
    		// The matching of C against the element's language value is performed case-insensitively.
    		// The identifier C does not have to be a valid language name."
    		// http://www.w3.org/TR/selectors/#lang-pseudo
    		"lang": markFunction( function( lang ) {

    			// lang value must be a valid identifier
    			if ( !ridentifier.test( lang || "" ) ) {
    				Sizzle.error( "unsupported lang: " + lang );
    			}
    			lang = lang.replace( runescape, funescape ).toLowerCase();
    			return function( elem ) {
    				var elemLang;
    				do {
    					if ( ( elemLang = documentIsHTML ?
    						elem.lang :
    						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

    						elemLang = elemLang.toLowerCase();
    						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
    					}
    				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
    				return false;
    			};
    		} ),

    		// Miscellaneous
    		"target": function( elem ) {
    			var hash = window.location && window.location.hash;
    			return hash && hash.slice( 1 ) === elem.id;
    		},

    		"root": function( elem ) {
    			return elem === docElem;
    		},

    		"focus": function( elem ) {
    			return elem === document.activeElement &&
    				( !document.hasFocus || document.hasFocus() ) &&
    				!!( elem.type || elem.href || ~elem.tabIndex );
    		},

    		// Boolean properties
    		"enabled": createDisabledPseudo( false ),
    		"disabled": createDisabledPseudo( true ),

    		"checked": function( elem ) {

    			// In CSS3, :checked should return both checked and selected elements
    			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
    			var nodeName = elem.nodeName.toLowerCase();
    			return ( nodeName === "input" && !!elem.checked ) ||
    				( nodeName === "option" && !!elem.selected );
    		},

    		"selected": function( elem ) {

    			// Accessing this property makes selected-by-default
    			// options in Safari work properly
    			if ( elem.parentNode ) {
    				// eslint-disable-next-line no-unused-expressions
    				elem.parentNode.selectedIndex;
    			}

    			return elem.selected === true;
    		},

    		// Contents
    		"empty": function( elem ) {

    			// http://www.w3.org/TR/selectors/#empty-pseudo
    			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
    			//   but not by others (comment: 8; processing instruction: 7; etc.)
    			// nodeType < 6 works because attributes (2) do not appear as children
    			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
    				if ( elem.nodeType < 6 ) {
    					return false;
    				}
    			}
    			return true;
    		},

    		"parent": function( elem ) {
    			return !Expr.pseudos[ "empty" ]( elem );
    		},

    		// Element/input types
    		"header": function( elem ) {
    			return rheader.test( elem.nodeName );
    		},

    		"input": function( elem ) {
    			return rinputs.test( elem.nodeName );
    		},

    		"button": function( elem ) {
    			var name = elem.nodeName.toLowerCase();
    			return name === "input" && elem.type === "button" || name === "button";
    		},

    		"text": function( elem ) {
    			var attr;
    			return elem.nodeName.toLowerCase() === "input" &&
    				elem.type === "text" &&

    				// Support: IE<8
    				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
    				( ( attr = elem.getAttribute( "type" ) ) == null ||
    					attr.toLowerCase() === "text" );
    		},

    		// Position-in-collection
    		"first": createPositionalPseudo( function() {
    			return [ 0 ];
    		} ),

    		"last": createPositionalPseudo( function( _matchIndexes, length ) {
    			return [ length - 1 ];
    		} ),

    		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
    			return [ argument < 0 ? argument + length : argument ];
    		} ),

    		"even": createPositionalPseudo( function( matchIndexes, length ) {
    			var i = 0;
    			for ( ; i < length; i += 2 ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"odd": createPositionalPseudo( function( matchIndexes, length ) {
    			var i = 1;
    			for ( ; i < length; i += 2 ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
    			var i = argument < 0 ?
    				argument + length :
    				argument > length ?
    					length :
    					argument;
    			for ( ; --i >= 0; ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} ),

    		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
    			var i = argument < 0 ? argument + length : argument;
    			for ( ; ++i < length; ) {
    				matchIndexes.push( i );
    			}
    			return matchIndexes;
    		} )
    	}
    };

    Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

    // Add button/input type pseudos
    for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
    	Expr.pseudos[ i ] = createInputPseudo( i );
    }
    for ( i in { submit: true, reset: true } ) {
    	Expr.pseudos[ i ] = createButtonPseudo( i );
    }

    // Easy API for creating new setFilters
    function setFilters() {}
    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
    	var matched, match, tokens, type,
    		soFar, groups, preFilters,
    		cached = tokenCache[ selector + " " ];

    	if ( cached ) {
    		return parseOnly ? 0 : cached.slice( 0 );
    	}

    	soFar = selector;
    	groups = [];
    	preFilters = Expr.preFilter;

    	while ( soFar ) {

    		// Comma and first run
    		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
    			if ( match ) {

    				// Don't consume trailing commas as valid
    				soFar = soFar.slice( match[ 0 ].length ) || soFar;
    			}
    			groups.push( ( tokens = [] ) );
    		}

    		matched = false;

    		// Combinators
    		if ( ( match = rcombinators.exec( soFar ) ) ) {
    			matched = match.shift();
    			tokens.push( {
    				value: matched,

    				// Cast descendant combinators to space
    				type: match[ 0 ].replace( rtrim, " " )
    			} );
    			soFar = soFar.slice( matched.length );
    		}

    		// Filters
    		for ( type in Expr.filter ) {
    			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
    				( match = preFilters[ type ]( match ) ) ) ) {
    				matched = match.shift();
    				tokens.push( {
    					value: matched,
    					type: type,
    					matches: match
    				} );
    				soFar = soFar.slice( matched.length );
    			}
    		}

    		if ( !matched ) {
    			break;
    		}
    	}

    	// Return the length of the invalid excess
    	// if we're just parsing
    	// Otherwise, throw an error or return tokens
    	return parseOnly ?
    		soFar.length :
    		soFar ?
    			Sizzle.error( selector ) :

    			// Cache the tokens
    			tokenCache( selector, groups ).slice( 0 );
    };

    function toSelector( tokens ) {
    	var i = 0,
    		len = tokens.length,
    		selector = "";
    	for ( ; i < len; i++ ) {
    		selector += tokens[ i ].value;
    	}
    	return selector;
    }

    function addCombinator( matcher, combinator, base ) {
    	var dir = combinator.dir,
    		skip = combinator.next,
    		key = skip || dir,
    		checkNonElements = base && key === "parentNode",
    		doneName = done++;

    	return combinator.first ?

    		// Check against closest ancestor/preceding element
    		function( elem, context, xml ) {
    			while ( ( elem = elem[ dir ] ) ) {
    				if ( elem.nodeType === 1 || checkNonElements ) {
    					return matcher( elem, context, xml );
    				}
    			}
    			return false;
    		} :

    		// Check against all ancestor/preceding elements
    		function( elem, context, xml ) {
    			var oldCache, uniqueCache, outerCache,
    				newCache = [ dirruns, doneName ];

    			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
    			if ( xml ) {
    				while ( ( elem = elem[ dir ] ) ) {
    					if ( elem.nodeType === 1 || checkNonElements ) {
    						if ( matcher( elem, context, xml ) ) {
    							return true;
    						}
    					}
    				}
    			} else {
    				while ( ( elem = elem[ dir ] ) ) {
    					if ( elem.nodeType === 1 || checkNonElements ) {
    						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

    						// Support: IE <9 only
    						// Defend against cloned attroperties (jQuery gh-1709)
    						uniqueCache = outerCache[ elem.uniqueID ] ||
    							( outerCache[ elem.uniqueID ] = {} );

    						if ( skip && skip === elem.nodeName.toLowerCase() ) {
    							elem = elem[ dir ] || elem;
    						} else if ( ( oldCache = uniqueCache[ key ] ) &&
    							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

    							// Assign to newCache so results back-propagate to previous elements
    							return ( newCache[ 2 ] = oldCache[ 2 ] );
    						} else {

    							// Reuse newcache so results back-propagate to previous elements
    							uniqueCache[ key ] = newCache;

    							// A match means we're done; a fail means we have to keep checking
    							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
    								return true;
    							}
    						}
    					}
    				}
    			}
    			return false;
    		};
    }

    function elementMatcher( matchers ) {
    	return matchers.length > 1 ?
    		function( elem, context, xml ) {
    			var i = matchers.length;
    			while ( i-- ) {
    				if ( !matchers[ i ]( elem, context, xml ) ) {
    					return false;
    				}
    			}
    			return true;
    		} :
    		matchers[ 0 ];
    }

    function multipleContexts( selector, contexts, results ) {
    	var i = 0,
    		len = contexts.length;
    	for ( ; i < len; i++ ) {
    		Sizzle( selector, contexts[ i ], results );
    	}
    	return results;
    }

    function condense( unmatched, map, filter, context, xml ) {
    	var elem,
    		newUnmatched = [],
    		i = 0,
    		len = unmatched.length,
    		mapped = map != null;

    	for ( ; i < len; i++ ) {
    		if ( ( elem = unmatched[ i ] ) ) {
    			if ( !filter || filter( elem, context, xml ) ) {
    				newUnmatched.push( elem );
    				if ( mapped ) {
    					map.push( i );
    				}
    			}
    		}
    	}

    	return newUnmatched;
    }

    function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
    	if ( postFilter && !postFilter[ expando ] ) {
    		postFilter = setMatcher( postFilter );
    	}
    	if ( postFinder && !postFinder[ expando ] ) {
    		postFinder = setMatcher( postFinder, postSelector );
    	}
    	return markFunction( function( seed, results, context, xml ) {
    		var temp, i, elem,
    			preMap = [],
    			postMap = [],
    			preexisting = results.length,

    			// Get initial elements from seed or context
    			elems = seed || multipleContexts(
    				selector || "*",
    				context.nodeType ? [ context ] : context,
    				[]
    			),

    			// Prefilter to get matcher input, preserving a map for seed-results synchronization
    			matcherIn = preFilter && ( seed || !selector ) ?
    				condense( elems, preMap, preFilter, context, xml ) :
    				elems,

    			matcherOut = matcher ?

    				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
    				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

    					// ...intermediate processing is necessary
    					[] :

    					// ...otherwise use results directly
    					results :
    				matcherIn;

    		// Find primary matches
    		if ( matcher ) {
    			matcher( matcherIn, matcherOut, context, xml );
    		}

    		// Apply postFilter
    		if ( postFilter ) {
    			temp = condense( matcherOut, postMap );
    			postFilter( temp, [], context, xml );

    			// Un-match failing elements by moving them back to matcherIn
    			i = temp.length;
    			while ( i-- ) {
    				if ( ( elem = temp[ i ] ) ) {
    					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
    				}
    			}
    		}

    		if ( seed ) {
    			if ( postFinder || preFilter ) {
    				if ( postFinder ) {

    					// Get the final matcherOut by condensing this intermediate into postFinder contexts
    					temp = [];
    					i = matcherOut.length;
    					while ( i-- ) {
    						if ( ( elem = matcherOut[ i ] ) ) {

    							// Restore matcherIn since elem is not yet a final match
    							temp.push( ( matcherIn[ i ] = elem ) );
    						}
    					}
    					postFinder( null, ( matcherOut = [] ), temp, xml );
    				}

    				// Move matched elements from seed to results to keep them synchronized
    				i = matcherOut.length;
    				while ( i-- ) {
    					if ( ( elem = matcherOut[ i ] ) &&
    						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

    						seed[ temp ] = !( results[ temp ] = elem );
    					}
    				}
    			}

    		// Add elements to results, through postFinder if defined
    		} else {
    			matcherOut = condense(
    				matcherOut === results ?
    					matcherOut.splice( preexisting, matcherOut.length ) :
    					matcherOut
    			);
    			if ( postFinder ) {
    				postFinder( null, results, matcherOut, xml );
    			} else {
    				push.apply( results, matcherOut );
    			}
    		}
    	} );
    }

    function matcherFromTokens( tokens ) {
    	var checkContext, matcher, j,
    		len = tokens.length,
    		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
    		implicitRelative = leadingRelative || Expr.relative[ " " ],
    		i = leadingRelative ? 1 : 0,

    		// The foundational matcher ensures that elements are reachable from top-level context(s)
    		matchContext = addCombinator( function( elem ) {
    			return elem === checkContext;
    		}, implicitRelative, true ),
    		matchAnyContext = addCombinator( function( elem ) {
    			return indexOf( checkContext, elem ) > -1;
    		}, implicitRelative, true ),
    		matchers = [ function( elem, context, xml ) {
    			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
    				( checkContext = context ).nodeType ?
    					matchContext( elem, context, xml ) :
    					matchAnyContext( elem, context, xml ) );

    			// Avoid hanging onto element (issue #299)
    			checkContext = null;
    			return ret;
    		} ];

    	for ( ; i < len; i++ ) {
    		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
    			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
    		} else {
    			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

    			// Return special upon seeing a positional matcher
    			if ( matcher[ expando ] ) {

    				// Find the next relative operator (if any) for proper handling
    				j = ++i;
    				for ( ; j < len; j++ ) {
    					if ( Expr.relative[ tokens[ j ].type ] ) {
    						break;
    					}
    				}
    				return setMatcher(
    					i > 1 && elementMatcher( matchers ),
    					i > 1 && toSelector(

    					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
    					tokens
    						.slice( 0, i - 1 )
    						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
    					).replace( rtrim, "$1" ),
    					matcher,
    					i < j && matcherFromTokens( tokens.slice( i, j ) ),
    					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
    					j < len && toSelector( tokens )
    				);
    			}
    			matchers.push( matcher );
    		}
    	}

    	return elementMatcher( matchers );
    }

    function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
    	var bySet = setMatchers.length > 0,
    		byElement = elementMatchers.length > 0,
    		superMatcher = function( seed, context, xml, results, outermost ) {
    			var elem, j, matcher,
    				matchedCount = 0,
    				i = "0",
    				unmatched = seed && [],
    				setMatched = [],
    				contextBackup = outermostContext,

    				// We must always have either seed elements or outermost context
    				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

    				// Use integer dirruns iff this is the outermost matcher
    				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
    				len = elems.length;

    			if ( outermost ) {

    				// Support: IE 11+, Edge 17 - 18+
    				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    				// two documents; shallow comparisons work.
    				// eslint-disable-next-line eqeqeq
    				outermostContext = context == document || context || outermost;
    			}

    			// Add elements passing elementMatchers directly to results
    			// Support: IE<9, Safari
    			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
    			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
    				if ( byElement && elem ) {
    					j = 0;

    					// Support: IE 11+, Edge 17 - 18+
    					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
    					// two documents; shallow comparisons work.
    					// eslint-disable-next-line eqeqeq
    					if ( !context && elem.ownerDocument != document ) {
    						setDocument( elem );
    						xml = !documentIsHTML;
    					}
    					while ( ( matcher = elementMatchers[ j++ ] ) ) {
    						if ( matcher( elem, context || document, xml ) ) {
    							results.push( elem );
    							break;
    						}
    					}
    					if ( outermost ) {
    						dirruns = dirrunsUnique;
    					}
    				}

    				// Track unmatched elements for set filters
    				if ( bySet ) {

    					// They will have gone through all possible matchers
    					if ( ( elem = !matcher && elem ) ) {
    						matchedCount--;
    					}

    					// Lengthen the array for every element, matched or not
    					if ( seed ) {
    						unmatched.push( elem );
    					}
    				}
    			}

    			// `i` is now the count of elements visited above, and adding it to `matchedCount`
    			// makes the latter nonnegative.
    			matchedCount += i;

    			// Apply set filters to unmatched elements
    			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
    			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
    			// no element matchers and no seed.
    			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
    			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
    			// numerically zero.
    			if ( bySet && i !== matchedCount ) {
    				j = 0;
    				while ( ( matcher = setMatchers[ j++ ] ) ) {
    					matcher( unmatched, setMatched, context, xml );
    				}

    				if ( seed ) {

    					// Reintegrate element matches to eliminate the need for sorting
    					if ( matchedCount > 0 ) {
    						while ( i-- ) {
    							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
    								setMatched[ i ] = pop.call( results );
    							}
    						}
    					}

    					// Discard index placeholder values to get only actual matches
    					setMatched = condense( setMatched );
    				}

    				// Add matches to results
    				push.apply( results, setMatched );

    				// Seedless set matches succeeding multiple successful matchers stipulate sorting
    				if ( outermost && !seed && setMatched.length > 0 &&
    					( matchedCount + setMatchers.length ) > 1 ) {

    					Sizzle.uniqueSort( results );
    				}
    			}

    			// Override manipulation of globals by nested matchers
    			if ( outermost ) {
    				dirruns = dirrunsUnique;
    				outermostContext = contextBackup;
    			}

    			return unmatched;
    		};

    	return bySet ?
    		markFunction( superMatcher ) :
    		superMatcher;
    }

    compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
    	var i,
    		setMatchers = [],
    		elementMatchers = [],
    		cached = compilerCache[ selector + " " ];

    	if ( !cached ) {

    		// Generate a function of recursive functions that can be used to check each element
    		if ( !match ) {
    			match = tokenize( selector );
    		}
    		i = match.length;
    		while ( i-- ) {
    			cached = matcherFromTokens( match[ i ] );
    			if ( cached[ expando ] ) {
    				setMatchers.push( cached );
    			} else {
    				elementMatchers.push( cached );
    			}
    		}

    		// Cache the compiled function
    		cached = compilerCache(
    			selector,
    			matcherFromGroupMatchers( elementMatchers, setMatchers )
    		);

    		// Save selector and tokenization
    		cached.selector = selector;
    	}
    	return cached;
    };

    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param {String|Function} selector A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param {Element} context
     * @param {Array} [results]
     * @param {Array} [seed] A set of elements to match against
     */
    select = Sizzle.select = function( selector, context, results, seed ) {
    	var i, tokens, token, type, find,
    		compiled = typeof selector === "function" && selector,
    		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

    	results = results || [];

    	// Try to minimize operations if there is only one selector in the list and no seed
    	// (the latter of which guarantees us context)
    	if ( match.length === 1 ) {

    		// Reduce context if the leading compound selector is an ID
    		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
    		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
    			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

    			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
    				.replace( runescape, funescape ), context ) || [] )[ 0 ];
    			if ( !context ) {
    				return results;

    			// Precompiled matchers will still verify ancestry, so step up a level
    			} else if ( compiled ) {
    				context = context.parentNode;
    			}

    			selector = selector.slice( tokens.shift().value.length );
    		}

    		// Fetch a seed set for right-to-left matching
    		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
    		while ( i-- ) {
    			token = tokens[ i ];

    			// Abort if we hit a combinator
    			if ( Expr.relative[ ( type = token.type ) ] ) {
    				break;
    			}
    			if ( ( find = Expr.find[ type ] ) ) {

    				// Search, expanding context for leading sibling combinators
    				if ( ( seed = find(
    					token.matches[ 0 ].replace( runescape, funescape ),
    					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
    						context
    				) ) ) {

    					// If seed is empty or no tokens remain, we can return early
    					tokens.splice( i, 1 );
    					selector = seed.length && toSelector( tokens );
    					if ( !selector ) {
    						push.apply( results, seed );
    						return results;
    					}

    					break;
    				}
    			}
    		}
    	}

    	// Compile and execute a filtering function if one is not provided
    	// Provide `match` to avoid retokenization if we modified the selector above
    	( compiled || compile( selector, match ) )(
    		seed,
    		context,
    		!documentIsHTML,
    		results,
    		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
    	);
    	return results;
    };

    // One-time assignments

    // Sort stability
    support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

    // Support: Chrome 14-35+
    // Always assume duplicates if they aren't passed to the comparison function
    support.detectDuplicates = !!hasDuplicate;

    // Initialize against the default document
    setDocument();

    // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*
    support.sortDetached = assert( function( el ) {

    	// Should return 1, but returns 4 (following)
    	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
    } );

    // Support: IE<8
    // Prevent attribute/property "interpolation"
    // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
    if ( !assert( function( el ) {
    	el.innerHTML = "<a href='#'></a>";
    	return el.firstChild.getAttribute( "href" ) === "#";
    } ) ) {
    	addHandle( "type|href|height|width", function( elem, name, isXML ) {
    		if ( !isXML ) {
    			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
    		}
    	} );
    }

    // Support: IE<9
    // Use defaultValue in place of getAttribute("value")
    if ( !support.attributes || !assert( function( el ) {
    	el.innerHTML = "<input/>";
    	el.firstChild.setAttribute( "value", "" );
    	return el.firstChild.getAttribute( "value" ) === "";
    } ) ) {
    	addHandle( "value", function( elem, _name, isXML ) {
    		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
    			return elem.defaultValue;
    		}
    	} );
    }

    // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies
    if ( !assert( function( el ) {
    	return el.getAttribute( "disabled" ) == null;
    } ) ) {
    	addHandle( booleans, function( elem, name, isXML ) {
    		var val;
    		if ( !isXML ) {
    			return elem[ name ] === true ? name.toLowerCase() :
    				( val = elem.getAttributeNode( name ) ) && val.specified ?
    					val.value :
    					null;
    		}
    	} );
    }

    return Sizzle;

    } )( window );



    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;

    // Deprecated
    jQuery.expr[ ":" ] = jQuery.expr.pseudos;
    jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;
    jQuery.escapeSelector = Sizzle.escape;




    var dir = function( elem, dir, until ) {
    	var matched = [],
    		truncate = until !== undefined;

    	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
    		if ( elem.nodeType === 1 ) {
    			if ( truncate && jQuery( elem ).is( until ) ) {
    				break;
    			}
    			matched.push( elem );
    		}
    	}
    	return matched;
    };


    var siblings = function( n, elem ) {
    	var matched = [];

    	for ( ; n; n = n.nextSibling ) {
    		if ( n.nodeType === 1 && n !== elem ) {
    			matched.push( n );
    		}
    	}

    	return matched;
    };


    var rneedsContext = jQuery.expr.match.needsContext;



    function nodeName( elem, name ) {

      return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

    }var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



    // Implement the identical functionality for filter and not
    function winnow( elements, qualifier, not ) {
    	if ( isFunction( qualifier ) ) {
    		return jQuery.grep( elements, function( elem, i ) {
    			return !!qualifier.call( elem, i, elem ) !== not;
    		} );
    	}

    	// Single element
    	if ( qualifier.nodeType ) {
    		return jQuery.grep( elements, function( elem ) {
    			return ( elem === qualifier ) !== not;
    		} );
    	}

    	// Arraylike of elements (jQuery, arguments, Array)
    	if ( typeof qualifier !== "string" ) {
    		return jQuery.grep( elements, function( elem ) {
    			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
    		} );
    	}

    	// Filtered directly for both simple and complex selectors
    	return jQuery.filter( qualifier, elements, not );
    }

    jQuery.filter = function( expr, elems, not ) {
    	var elem = elems[ 0 ];

    	if ( not ) {
    		expr = ":not(" + expr + ")";
    	}

    	if ( elems.length === 1 && elem.nodeType === 1 ) {
    		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
    	}

    	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
    		return elem.nodeType === 1;
    	} ) );
    };

    jQuery.fn.extend( {
    	find: function( selector ) {
    		var i, ret,
    			len = this.length,
    			self = this;

    		if ( typeof selector !== "string" ) {
    			return this.pushStack( jQuery( selector ).filter( function() {
    				for ( i = 0; i < len; i++ ) {
    					if ( jQuery.contains( self[ i ], this ) ) {
    						return true;
    					}
    				}
    			} ) );
    		}

    		ret = this.pushStack( [] );

    		for ( i = 0; i < len; i++ ) {
    			jQuery.find( selector, self[ i ], ret );
    		}

    		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
    	},
    	filter: function( selector ) {
    		return this.pushStack( winnow( this, selector || [], false ) );
    	},
    	not: function( selector ) {
    		return this.pushStack( winnow( this, selector || [], true ) );
    	},
    	is: function( selector ) {
    		return !!winnow(
    			this,

    			// If this is a positional/relative selector, check membership in the returned set
    			// so $("p:first").is("p:last") won't return true for a doc with two "p".
    			typeof selector === "string" && rneedsContext.test( selector ) ?
    				jQuery( selector ) :
    				selector || [],
    			false
    		).length;
    	}
    } );


    // Initialize a jQuery object


    // A central reference to the root jQuery(document)
    var rootjQuery,

    	// A simple way to check for HTML strings
    	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    	// Strict HTML recognition (#11290: must start with <)
    	// Shortcut simple #id case for speed
    	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

    	init = jQuery.fn.init = function( selector, context, root ) {
    		var match, elem;

    		// HANDLE: $(""), $(null), $(undefined), $(false)
    		if ( !selector ) {
    			return this;
    		}

    		// Method init() accepts an alternate rootjQuery
    		// so migrate can support jQuery.sub (gh-2101)
    		root = root || rootjQuery;

    		// Handle HTML strings
    		if ( typeof selector === "string" ) {
    			if ( selector[ 0 ] === "<" &&
    				selector[ selector.length - 1 ] === ">" &&
    				selector.length >= 3 ) {

    				// Assume that strings that start and end with <> are HTML and skip the regex check
    				match = [ null, selector, null ];

    			} else {
    				match = rquickExpr.exec( selector );
    			}

    			// Match html or make sure no context is specified for #id
    			if ( match && ( match[ 1 ] || !context ) ) {

    				// HANDLE: $(html) -> $(array)
    				if ( match[ 1 ] ) {
    					context = context instanceof jQuery ? context[ 0 ] : context;

    					// Option to run scripts is true for back-compat
    					// Intentionally let the error be thrown if parseHTML is not present
    					jQuery.merge( this, jQuery.parseHTML(
    						match[ 1 ],
    						context && context.nodeType ? context.ownerDocument || context : document,
    						true
    					) );

    					// HANDLE: $(html, props)
    					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
    						for ( match in context ) {

    							// Properties of context are called as methods if possible
    							if ( isFunction( this[ match ] ) ) {
    								this[ match ]( context[ match ] );

    							// ...and otherwise set as attributes
    							} else {
    								this.attr( match, context[ match ] );
    							}
    						}
    					}

    					return this;

    				// HANDLE: $(#id)
    				} else {
    					elem = document.getElementById( match[ 2 ] );

    					if ( elem ) {

    						// Inject the element directly into the jQuery object
    						this[ 0 ] = elem;
    						this.length = 1;
    					}
    					return this;
    				}

    			// HANDLE: $(expr, $(...))
    			} else if ( !context || context.jquery ) {
    				return ( context || root ).find( selector );

    			// HANDLE: $(expr, context)
    			// (which is just equivalent to: $(context).find(expr)
    			} else {
    				return this.constructor( context ).find( selector );
    			}

    		// HANDLE: $(DOMElement)
    		} else if ( selector.nodeType ) {
    			this[ 0 ] = selector;
    			this.length = 1;
    			return this;

    		// HANDLE: $(function)
    		// Shortcut for document ready
    		} else if ( isFunction( selector ) ) {
    			return root.ready !== undefined ?
    				root.ready( selector ) :

    				// Execute immediately if ready is not present
    				selector( jQuery );
    		}

    		return jQuery.makeArray( selector, this );
    	};

    // Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;

    // Initialize central reference
    rootjQuery = jQuery( document );


    var rparentsprev = /^(?:parents|prev(?:Until|All))/,

    	// Methods guaranteed to produce a unique set when starting from a unique set
    	guaranteedUnique = {
    		children: true,
    		contents: true,
    		next: true,
    		prev: true
    	};

    jQuery.fn.extend( {
    	has: function( target ) {
    		var targets = jQuery( target, this ),
    			l = targets.length;

    		return this.filter( function() {
    			var i = 0;
    			for ( ; i < l; i++ ) {
    				if ( jQuery.contains( this, targets[ i ] ) ) {
    					return true;
    				}
    			}
    		} );
    	},

    	closest: function( selectors, context ) {
    		var cur,
    			i = 0,
    			l = this.length,
    			matched = [],
    			targets = typeof selectors !== "string" && jQuery( selectors );

    		// Positional selectors never match, since there's no _selection_ context
    		if ( !rneedsContext.test( selectors ) ) {
    			for ( ; i < l; i++ ) {
    				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

    					// Always skip document fragments
    					if ( cur.nodeType < 11 && ( targets ?
    						targets.index( cur ) > -1 :

    						// Don't pass non-elements to Sizzle
    						cur.nodeType === 1 &&
    							jQuery.find.matchesSelector( cur, selectors ) ) ) {

    						matched.push( cur );
    						break;
    					}
    				}
    			}
    		}

    		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
    	},

    	// Determine the position of an element within the set
    	index: function( elem ) {

    		// No argument, return index in parent
    		if ( !elem ) {
    			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
    		}

    		// Index in selector
    		if ( typeof elem === "string" ) {
    			return indexOf.call( jQuery( elem ), this[ 0 ] );
    		}

    		// Locate the position of the desired element
    		return indexOf.call( this,

    			// If it receives a jQuery object, the first element is used
    			elem.jquery ? elem[ 0 ] : elem
    		);
    	},

    	add: function( selector, context ) {
    		return this.pushStack(
    			jQuery.uniqueSort(
    				jQuery.merge( this.get(), jQuery( selector, context ) )
    			)
    		);
    	},

    	addBack: function( selector ) {
    		return this.add( selector == null ?
    			this.prevObject : this.prevObject.filter( selector )
    		);
    	}
    } );

    function sibling( cur, dir ) {
    	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
    	return cur;
    }

    jQuery.each( {
    	parent: function( elem ) {
    		var parent = elem.parentNode;
    		return parent && parent.nodeType !== 11 ? parent : null;
    	},
    	parents: function( elem ) {
    		return dir( elem, "parentNode" );
    	},
    	parentsUntil: function( elem, _i, until ) {
    		return dir( elem, "parentNode", until );
    	},
    	next: function( elem ) {
    		return sibling( elem, "nextSibling" );
    	},
    	prev: function( elem ) {
    		return sibling( elem, "previousSibling" );
    	},
    	nextAll: function( elem ) {
    		return dir( elem, "nextSibling" );
    	},
    	prevAll: function( elem ) {
    		return dir( elem, "previousSibling" );
    	},
    	nextUntil: function( elem, _i, until ) {
    		return dir( elem, "nextSibling", until );
    	},
    	prevUntil: function( elem, _i, until ) {
    		return dir( elem, "previousSibling", until );
    	},
    	siblings: function( elem ) {
    		return siblings( ( elem.parentNode || {} ).firstChild, elem );
    	},
    	children: function( elem ) {
    		return siblings( elem.firstChild );
    	},
    	contents: function( elem ) {
    		if ( elem.contentDocument != null &&

    			// Support: IE 11+
    			// <object> elements with no `data` attribute has an object
    			// `contentDocument` with a `null` prototype.
    			getProto( elem.contentDocument ) ) {

    			return elem.contentDocument;
    		}

    		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
    		// Treat the template element as a regular one in browsers that
    		// don't support it.
    		if ( nodeName( elem, "template" ) ) {
    			elem = elem.content || elem;
    		}

    		return jQuery.merge( [], elem.childNodes );
    	}
    }, function( name, fn ) {
    	jQuery.fn[ name ] = function( until, selector ) {
    		var matched = jQuery.map( this, fn, until );

    		if ( name.slice( -5 ) !== "Until" ) {
    			selector = until;
    		}

    		if ( selector && typeof selector === "string" ) {
    			matched = jQuery.filter( selector, matched );
    		}

    		if ( this.length > 1 ) {

    			// Remove duplicates
    			if ( !guaranteedUnique[ name ] ) {
    				jQuery.uniqueSort( matched );
    			}

    			// Reverse order for parents* and prev-derivatives
    			if ( rparentsprev.test( name ) ) {
    				matched.reverse();
    			}
    		}

    		return this.pushStack( matched );
    	};
    } );
    var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



    // Convert String-formatted options into Object-formatted ones
    function createOptions( options ) {
    	var object = {};
    	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
    		object[ flag ] = true;
    	} );
    	return object;
    }

    /*
     * Create a callback list using the following parameters:
     *
     *	options: an optional list of space-separated options that will change how
     *			the callback list behaves or a more traditional option object
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible options:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    jQuery.Callbacks = function( options ) {

    	// Convert options from String-formatted to Object-formatted if needed
    	// (we check in cache first)
    	options = typeof options === "string" ?
    		createOptions( options ) :
    		jQuery.extend( {}, options );

    	var // Flag to know if list is currently firing
    		firing,

    		// Last fire value for non-forgettable lists
    		memory,

    		// Flag to know if list was already fired
    		fired,

    		// Flag to prevent firing
    		locked,

    		// Actual callback list
    		list = [],

    		// Queue of execution data for repeatable lists
    		queue = [],

    		// Index of currently firing callback (modified by add/remove as needed)
    		firingIndex = -1,

    		// Fire callbacks
    		fire = function() {

    			// Enforce single-firing
    			locked = locked || options.once;

    			// Execute callbacks for all pending executions,
    			// respecting firingIndex overrides and runtime changes
    			fired = firing = true;
    			for ( ; queue.length; firingIndex = -1 ) {
    				memory = queue.shift();
    				while ( ++firingIndex < list.length ) {

    					// Run callback and check for early termination
    					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
    						options.stopOnFalse ) {

    						// Jump to end and forget the data so .add doesn't re-fire
    						firingIndex = list.length;
    						memory = false;
    					}
    				}
    			}

    			// Forget the data if we're done with it
    			if ( !options.memory ) {
    				memory = false;
    			}

    			firing = false;

    			// Clean up if we're done firing for good
    			if ( locked ) {

    				// Keep an empty list if we have data for future add calls
    				if ( memory ) {
    					list = [];

    				// Otherwise, this object is spent
    				} else {
    					list = "";
    				}
    			}
    		},

    		// Actual Callbacks object
    		self = {

    			// Add a callback or a collection of callbacks to the list
    			add: function() {
    				if ( list ) {

    					// If we have memory from a past run, we should fire after adding
    					if ( memory && !firing ) {
    						firingIndex = list.length - 1;
    						queue.push( memory );
    					}

    					( function add( args ) {
    						jQuery.each( args, function( _, arg ) {
    							if ( isFunction( arg ) ) {
    								if ( !options.unique || !self.has( arg ) ) {
    									list.push( arg );
    								}
    							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

    								// Inspect recursively
    								add( arg );
    							}
    						} );
    					} )( arguments );

    					if ( memory && !firing ) {
    						fire();
    					}
    				}
    				return this;
    			},

    			// Remove a callback from the list
    			remove: function() {
    				jQuery.each( arguments, function( _, arg ) {
    					var index;
    					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
    						list.splice( index, 1 );

    						// Handle firing indexes
    						if ( index <= firingIndex ) {
    							firingIndex--;
    						}
    					}
    				} );
    				return this;
    			},

    			// Check if a given callback is in the list.
    			// If no argument is given, return whether or not list has callbacks attached.
    			has: function( fn ) {
    				return fn ?
    					jQuery.inArray( fn, list ) > -1 :
    					list.length > 0;
    			},

    			// Remove all callbacks from the list
    			empty: function() {
    				if ( list ) {
    					list = [];
    				}
    				return this;
    			},

    			// Disable .fire and .add
    			// Abort any current/pending executions
    			// Clear all callbacks and values
    			disable: function() {
    				locked = queue = [];
    				list = memory = "";
    				return this;
    			},
    			disabled: function() {
    				return !list;
    			},

    			// Disable .fire
    			// Also disable .add unless we have memory (since it would have no effect)
    			// Abort any pending executions
    			lock: function() {
    				locked = queue = [];
    				if ( !memory && !firing ) {
    					list = memory = "";
    				}
    				return this;
    			},
    			locked: function() {
    				return !!locked;
    			},

    			// Call all callbacks with the given context and arguments
    			fireWith: function( context, args ) {
    				if ( !locked ) {
    					args = args || [];
    					args = [ context, args.slice ? args.slice() : args ];
    					queue.push( args );
    					if ( !firing ) {
    						fire();
    					}
    				}
    				return this;
    			},

    			// Call all the callbacks with the given arguments
    			fire: function() {
    				self.fireWith( this, arguments );
    				return this;
    			},

    			// To know if the callbacks have already been called at least once
    			fired: function() {
    				return !!fired;
    			}
    		};

    	return self;
    };


    function Identity( v ) {
    	return v;
    }
    function Thrower( ex ) {
    	throw ex;
    }

    function adoptValue( value, resolve, reject, noValue ) {
    	var method;

    	try {

    		// Check for promise aspect first to privilege synchronous behavior
    		if ( value && isFunction( ( method = value.promise ) ) ) {
    			method.call( value ).done( resolve ).fail( reject );

    		// Other thenables
    		} else if ( value && isFunction( ( method = value.then ) ) ) {
    			method.call( value, resolve, reject );

    		// Other non-thenables
    		} else {

    			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
    			// * false: [ value ].slice( 0 ) => resolve( value )
    			// * true: [ value ].slice( 1 ) => resolve()
    			resolve.apply( undefined, [ value ].slice( noValue ) );
    		}

    	// For Promises/A+, convert exceptions into rejections
    	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
    	// Deferred#then to conditionally suppress rejection.
    	} catch ( value ) {

    		// Support: Android 4.0 only
    		// Strict mode functions invoked without .call/.apply get global-object context
    		reject.apply( undefined, [ value ] );
    	}
    }

    jQuery.extend( {

    	Deferred: function( func ) {
    		var tuples = [

    				// action, add listener, callbacks,
    				// ... .then handlers, argument index, [final state]
    				[ "notify", "progress", jQuery.Callbacks( "memory" ),
    					jQuery.Callbacks( "memory" ), 2 ],
    				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
    					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
    				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
    					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
    			],
    			state = "pending",
    			promise = {
    				state: function() {
    					return state;
    				},
    				always: function() {
    					deferred.done( arguments ).fail( arguments );
    					return this;
    				},
    				"catch": function( fn ) {
    					return promise.then( null, fn );
    				},

    				// Keep pipe for back-compat
    				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
    					var fns = arguments;

    					return jQuery.Deferred( function( newDefer ) {
    						jQuery.each( tuples, function( _i, tuple ) {

    							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
    							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

    							// deferred.progress(function() { bind to newDefer or newDefer.notify })
    							// deferred.done(function() { bind to newDefer or newDefer.resolve })
    							// deferred.fail(function() { bind to newDefer or newDefer.reject })
    							deferred[ tuple[ 1 ] ]( function() {
    								var returned = fn && fn.apply( this, arguments );
    								if ( returned && isFunction( returned.promise ) ) {
    									returned.promise()
    										.progress( newDefer.notify )
    										.done( newDefer.resolve )
    										.fail( newDefer.reject );
    								} else {
    									newDefer[ tuple[ 0 ] + "With" ](
    										this,
    										fn ? [ returned ] : arguments
    									);
    								}
    							} );
    						} );
    						fns = null;
    					} ).promise();
    				},
    				then: function( onFulfilled, onRejected, onProgress ) {
    					var maxDepth = 0;
    					function resolve( depth, deferred, handler, special ) {
    						return function() {
    							var that = this,
    								args = arguments,
    								mightThrow = function() {
    									var returned, then;

    									// Support: Promises/A+ section 2.3.3.3.3
    									// https://promisesaplus.com/#point-59
    									// Ignore double-resolution attempts
    									if ( depth < maxDepth ) {
    										return;
    									}

    									returned = handler.apply( that, args );

    									// Support: Promises/A+ section 2.3.1
    									// https://promisesaplus.com/#point-48
    									if ( returned === deferred.promise() ) {
    										throw new TypeError( "Thenable self-resolution" );
    									}

    									// Support: Promises/A+ sections 2.3.3.1, 3.5
    									// https://promisesaplus.com/#point-54
    									// https://promisesaplus.com/#point-75
    									// Retrieve `then` only once
    									then = returned &&

    										// Support: Promises/A+ section 2.3.4
    										// https://promisesaplus.com/#point-64
    										// Only check objects and functions for thenability
    										( typeof returned === "object" ||
    											typeof returned === "function" ) &&
    										returned.then;

    									// Handle a returned thenable
    									if ( isFunction( then ) ) {

    										// Special processors (notify) just wait for resolution
    										if ( special ) {
    											then.call(
    												returned,
    												resolve( maxDepth, deferred, Identity, special ),
    												resolve( maxDepth, deferred, Thrower, special )
    											);

    										// Normal processors (resolve) also hook into progress
    										} else {

    											// ...and disregard older resolution values
    											maxDepth++;

    											then.call(
    												returned,
    												resolve( maxDepth, deferred, Identity, special ),
    												resolve( maxDepth, deferred, Thrower, special ),
    												resolve( maxDepth, deferred, Identity,
    													deferred.notifyWith )
    											);
    										}

    									// Handle all other returned values
    									} else {

    										// Only substitute handlers pass on context
    										// and multiple values (non-spec behavior)
    										if ( handler !== Identity ) {
    											that = undefined;
    											args = [ returned ];
    										}

    										// Process the value(s)
    										// Default process is resolve
    										( special || deferred.resolveWith )( that, args );
    									}
    								},

    								// Only normal processors (resolve) catch and reject exceptions
    								process = special ?
    									mightThrow :
    									function() {
    										try {
    											mightThrow();
    										} catch ( e ) {

    											if ( jQuery.Deferred.exceptionHook ) {
    												jQuery.Deferred.exceptionHook( e,
    													process.stackTrace );
    											}

    											// Support: Promises/A+ section 2.3.3.3.4.1
    											// https://promisesaplus.com/#point-61
    											// Ignore post-resolution exceptions
    											if ( depth + 1 >= maxDepth ) {

    												// Only substitute handlers pass on context
    												// and multiple values (non-spec behavior)
    												if ( handler !== Thrower ) {
    													that = undefined;
    													args = [ e ];
    												}

    												deferred.rejectWith( that, args );
    											}
    										}
    									};

    							// Support: Promises/A+ section 2.3.3.3.1
    							// https://promisesaplus.com/#point-57
    							// Re-resolve promises immediately to dodge false rejection from
    							// subsequent errors
    							if ( depth ) {
    								process();
    							} else {

    								// Call an optional hook to record the stack, in case of exception
    								// since it's otherwise lost when execution goes async
    								if ( jQuery.Deferred.getStackHook ) {
    									process.stackTrace = jQuery.Deferred.getStackHook();
    								}
    								window.setTimeout( process );
    							}
    						};
    					}

    					return jQuery.Deferred( function( newDefer ) {

    						// progress_handlers.add( ... )
    						tuples[ 0 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onProgress ) ?
    									onProgress :
    									Identity,
    								newDefer.notifyWith
    							)
    						);

    						// fulfilled_handlers.add( ... )
    						tuples[ 1 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onFulfilled ) ?
    									onFulfilled :
    									Identity
    							)
    						);

    						// rejected_handlers.add( ... )
    						tuples[ 2 ][ 3 ].add(
    							resolve(
    								0,
    								newDefer,
    								isFunction( onRejected ) ?
    									onRejected :
    									Thrower
    							)
    						);
    					} ).promise();
    				},

    				// Get a promise for this deferred
    				// If obj is provided, the promise aspect is added to the object
    				promise: function( obj ) {
    					return obj != null ? jQuery.extend( obj, promise ) : promise;
    				}
    			},
    			deferred = {};

    		// Add list-specific methods
    		jQuery.each( tuples, function( i, tuple ) {
    			var list = tuple[ 2 ],
    				stateString = tuple[ 5 ];

    			// promise.progress = list.add
    			// promise.done = list.add
    			// promise.fail = list.add
    			promise[ tuple[ 1 ] ] = list.add;

    			// Handle state
    			if ( stateString ) {
    				list.add(
    					function() {

    						// state = "resolved" (i.e., fulfilled)
    						// state = "rejected"
    						state = stateString;
    					},

    					// rejected_callbacks.disable
    					// fulfilled_callbacks.disable
    					tuples[ 3 - i ][ 2 ].disable,

    					// rejected_handlers.disable
    					// fulfilled_handlers.disable
    					tuples[ 3 - i ][ 3 ].disable,

    					// progress_callbacks.lock
    					tuples[ 0 ][ 2 ].lock,

    					// progress_handlers.lock
    					tuples[ 0 ][ 3 ].lock
    				);
    			}

    			// progress_handlers.fire
    			// fulfilled_handlers.fire
    			// rejected_handlers.fire
    			list.add( tuple[ 3 ].fire );

    			// deferred.notify = function() { deferred.notifyWith(...) }
    			// deferred.resolve = function() { deferred.resolveWith(...) }
    			// deferred.reject = function() { deferred.rejectWith(...) }
    			deferred[ tuple[ 0 ] ] = function() {
    				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
    				return this;
    			};

    			// deferred.notifyWith = list.fireWith
    			// deferred.resolveWith = list.fireWith
    			// deferred.rejectWith = list.fireWith
    			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
    		} );

    		// Make the deferred a promise
    		promise.promise( deferred );

    		// Call given func if any
    		if ( func ) {
    			func.call( deferred, deferred );
    		}

    		// All done!
    		return deferred;
    	},

    	// Deferred helper
    	when: function( singleValue ) {
    		var

    			// count of uncompleted subordinates
    			remaining = arguments.length,

    			// count of unprocessed arguments
    			i = remaining,

    			// subordinate fulfillment data
    			resolveContexts = Array( i ),
    			resolveValues = slice.call( arguments ),

    			// the master Deferred
    			master = jQuery.Deferred(),

    			// subordinate callback factory
    			updateFunc = function( i ) {
    				return function( value ) {
    					resolveContexts[ i ] = this;
    					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
    					if ( !( --remaining ) ) {
    						master.resolveWith( resolveContexts, resolveValues );
    					}
    				};
    			};

    		// Single- and empty arguments are adopted like Promise.resolve
    		if ( remaining <= 1 ) {
    			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
    				!remaining );

    			// Use .then() to unwrap secondary thenables (cf. gh-3000)
    			if ( master.state() === "pending" ||
    				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

    				return master.then();
    			}
    		}

    		// Multiple arguments are aggregated like Promise.all array elements
    		while ( i-- ) {
    			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
    		}

    		return master.promise();
    	}
    } );


    // These usually indicate a programmer mistake during development,
    // warn about them ASAP rather than swallowing them by default.
    var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

    jQuery.Deferred.exceptionHook = function( error, stack ) {

    	// Support: IE 8 - 9 only
    	// Console exists when dev tools are open, which can happen at any time
    	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
    		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
    	}
    };




    jQuery.readyException = function( error ) {
    	window.setTimeout( function() {
    		throw error;
    	} );
    };




    // The deferred used on DOM ready
    var readyList = jQuery.Deferred();

    jQuery.fn.ready = function( fn ) {

    	readyList
    		.then( fn )

    		// Wrap jQuery.readyException in a function so that the lookup
    		// happens at the time of error handling instead of callback
    		// registration.
    		.catch( function( error ) {
    			jQuery.readyException( error );
    		} );

    	return this;
    };

    jQuery.extend( {

    	// Is the DOM ready to be used? Set to true once it occurs.
    	isReady: false,

    	// A counter to track how many items to wait for before
    	// the ready event fires. See #6781
    	readyWait: 1,

    	// Handle when the DOM is ready
    	ready: function( wait ) {

    		// Abort if there are pending holds or we're already ready
    		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
    			return;
    		}

    		// Remember that the DOM is ready
    		jQuery.isReady = true;

    		// If a normal DOM Ready event fired, decrement, and wait if need be
    		if ( wait !== true && --jQuery.readyWait > 0 ) {
    			return;
    		}

    		// If there are functions bound, to execute
    		readyList.resolveWith( document, [ jQuery ] );
    	}
    } );

    jQuery.ready.then = readyList.then;

    // The ready event handler and self cleanup method
    function completed() {
    	document.removeEventListener( "DOMContentLoaded", completed );
    	window.removeEventListener( "load", completed );
    	jQuery.ready();
    }

    // Catch cases where $(document).ready() is called
    // after the browser event has already occurred.
    // Support: IE <=9 - 10 only
    // Older IE sometimes signals "interactive" too soon
    if ( document.readyState === "complete" ||
    	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

    	// Handle it asynchronously to allow scripts the opportunity to delay ready
    	window.setTimeout( jQuery.ready );

    } else {

    	// Use the handy event callback
    	document.addEventListener( "DOMContentLoaded", completed );

    	// A fallback to window.onload, that will always work
    	window.addEventListener( "load", completed );
    }




    // Multifunctional method to get and set values of a collection
    // The value/s can optionally be executed if it's a function
    var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
    	var i = 0,
    		len = elems.length,
    		bulk = key == null;

    	// Sets many values
    	if ( toType( key ) === "object" ) {
    		chainable = true;
    		for ( i in key ) {
    			access( elems, fn, i, key[ i ], true, emptyGet, raw );
    		}

    	// Sets one value
    	} else if ( value !== undefined ) {
    		chainable = true;

    		if ( !isFunction( value ) ) {
    			raw = true;
    		}

    		if ( bulk ) {

    			// Bulk operations run against the entire set
    			if ( raw ) {
    				fn.call( elems, value );
    				fn = null;

    			// ...except when executing function values
    			} else {
    				bulk = fn;
    				fn = function( elem, _key, value ) {
    					return bulk.call( jQuery( elem ), value );
    				};
    			}
    		}

    		if ( fn ) {
    			for ( ; i < len; i++ ) {
    				fn(
    					elems[ i ], key, raw ?
    					value :
    					value.call( elems[ i ], i, fn( elems[ i ], key ) )
    				);
    			}
    		}
    	}

    	if ( chainable ) {
    		return elems;
    	}

    	// Gets
    	if ( bulk ) {
    		return fn.call( elems );
    	}

    	return len ? fn( elems[ 0 ], key ) : emptyGet;
    };


    // Matches dashed string for camelizing
    var rmsPrefix = /^-ms-/,
    	rdashAlpha = /-([a-z])/g;

    // Used by camelCase as callback to replace()
    function fcamelCase( _all, letter ) {
    	return letter.toUpperCase();
    }

    // Convert dashed to camelCase; used by the css and data modules
    // Support: IE <=9 - 11, Edge 12 - 15
    // Microsoft forgot to hump their vendor prefix (#9572)
    function camelCase( string ) {
    	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
    }
    var acceptData = function( owner ) {

    	// Accepts only:
    	//  - Node
    	//    - Node.ELEMENT_NODE
    	//    - Node.DOCUMENT_NODE
    	//  - Object
    	//    - Any
    	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
    };




    function Data() {
    	this.expando = jQuery.expando + Data.uid++;
    }

    Data.uid = 1;

    Data.prototype = {

    	cache: function( owner ) {

    		// Check if the owner object already has a cache
    		var value = owner[ this.expando ];

    		// If not, create one
    		if ( !value ) {
    			value = {};

    			// We can accept data for non-element nodes in modern browsers,
    			// but we should not, see #8335.
    			// Always return an empty object.
    			if ( acceptData( owner ) ) {

    				// If it is a node unlikely to be stringify-ed or looped over
    				// use plain assignment
    				if ( owner.nodeType ) {
    					owner[ this.expando ] = value;

    				// Otherwise secure it in a non-enumerable property
    				// configurable must be true to allow the property to be
    				// deleted when data is removed
    				} else {
    					Object.defineProperty( owner, this.expando, {
    						value: value,
    						configurable: true
    					} );
    				}
    			}
    		}

    		return value;
    	},
    	set: function( owner, data, value ) {
    		var prop,
    			cache = this.cache( owner );

    		// Handle: [ owner, key, value ] args
    		// Always use camelCase key (gh-2257)
    		if ( typeof data === "string" ) {
    			cache[ camelCase( data ) ] = value;

    		// Handle: [ owner, { properties } ] args
    		} else {

    			// Copy the properties one-by-one to the cache object
    			for ( prop in data ) {
    				cache[ camelCase( prop ) ] = data[ prop ];
    			}
    		}
    		return cache;
    	},
    	get: function( owner, key ) {
    		return key === undefined ?
    			this.cache( owner ) :

    			// Always use camelCase key (gh-2257)
    			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
    	},
    	access: function( owner, key, value ) {

    		// In cases where either:
    		//
    		//   1. No key was specified
    		//   2. A string key was specified, but no value provided
    		//
    		// Take the "read" path and allow the get method to determine
    		// which value to return, respectively either:
    		//
    		//   1. The entire cache object
    		//   2. The data stored at the key
    		//
    		if ( key === undefined ||
    				( ( key && typeof key === "string" ) && value === undefined ) ) {

    			return this.get( owner, key );
    		}

    		// When the key is not a string, or both a key and value
    		// are specified, set or extend (existing objects) with either:
    		//
    		//   1. An object of properties
    		//   2. A key and value
    		//
    		this.set( owner, key, value );

    		// Since the "set" path can have two possible entry points
    		// return the expected data based on which path was taken[*]
    		return value !== undefined ? value : key;
    	},
    	remove: function( owner, key ) {
    		var i,
    			cache = owner[ this.expando ];

    		if ( cache === undefined ) {
    			return;
    		}

    		if ( key !== undefined ) {

    			// Support array or space separated string of keys
    			if ( Array.isArray( key ) ) {

    				// If key is an array of keys...
    				// We always set camelCase keys, so remove that.
    				key = key.map( camelCase );
    			} else {
    				key = camelCase( key );

    				// If a key with the spaces exists, use it.
    				// Otherwise, create an array by matching non-whitespace
    				key = key in cache ?
    					[ key ] :
    					( key.match( rnothtmlwhite ) || [] );
    			}

    			i = key.length;

    			while ( i-- ) {
    				delete cache[ key[ i ] ];
    			}
    		}

    		// Remove the expando if there's no more data
    		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

    			// Support: Chrome <=35 - 45
    			// Webkit & Blink performance suffers when deleting properties
    			// from DOM nodes, so set to undefined instead
    			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
    			if ( owner.nodeType ) {
    				owner[ this.expando ] = undefined;
    			} else {
    				delete owner[ this.expando ];
    			}
    		}
    	},
    	hasData: function( owner ) {
    		var cache = owner[ this.expando ];
    		return cache !== undefined && !jQuery.isEmptyObject( cache );
    	}
    };
    var dataPriv = new Data();

    var dataUser = new Data();



    //	Implementation Summary
    //
    //	1. Enforce API surface and semantic compatibility with 1.9.x branch
    //	2. Improve the module's maintainability by reducing the storage
    //		paths to a single mechanism.
    //	3. Use the same single mechanism to support "private" and "user" data.
    //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
    //	5. Avoid exposing implementation details on user objects (eg. expando properties)
    //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    	rmultiDash = /[A-Z]/g;

    function getData( data ) {
    	if ( data === "true" ) {
    		return true;
    	}

    	if ( data === "false" ) {
    		return false;
    	}

    	if ( data === "null" ) {
    		return null;
    	}

    	// Only convert to a number if it doesn't change the string
    	if ( data === +data + "" ) {
    		return +data;
    	}

    	if ( rbrace.test( data ) ) {
    		return JSON.parse( data );
    	}

    	return data;
    }

    function dataAttr( elem, key, data ) {
    	var name;

    	// If nothing was found internally, try to fetch any
    	// data from the HTML5 data-* attribute
    	if ( data === undefined && elem.nodeType === 1 ) {
    		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
    		data = elem.getAttribute( name );

    		if ( typeof data === "string" ) {
    			try {
    				data = getData( data );
    			} catch ( e ) {}

    			// Make sure we set the data so it isn't changed later
    			dataUser.set( elem, key, data );
    		} else {
    			data = undefined;
    		}
    	}
    	return data;
    }

    jQuery.extend( {
    	hasData: function( elem ) {
    		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
    	},

    	data: function( elem, name, data ) {
    		return dataUser.access( elem, name, data );
    	},

    	removeData: function( elem, name ) {
    		dataUser.remove( elem, name );
    	},

    	// TODO: Now that all calls to _data and _removeData have been replaced
    	// with direct calls to dataPriv methods, these can be deprecated.
    	_data: function( elem, name, data ) {
    		return dataPriv.access( elem, name, data );
    	},

    	_removeData: function( elem, name ) {
    		dataPriv.remove( elem, name );
    	}
    } );

    jQuery.fn.extend( {
    	data: function( key, value ) {
    		var i, name, data,
    			elem = this[ 0 ],
    			attrs = elem && elem.attributes;

    		// Gets all values
    		if ( key === undefined ) {
    			if ( this.length ) {
    				data = dataUser.get( elem );

    				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
    					i = attrs.length;
    					while ( i-- ) {

    						// Support: IE 11 only
    						// The attrs elements can be null (#14894)
    						if ( attrs[ i ] ) {
    							name = attrs[ i ].name;
    							if ( name.indexOf( "data-" ) === 0 ) {
    								name = camelCase( name.slice( 5 ) );
    								dataAttr( elem, name, data[ name ] );
    							}
    						}
    					}
    					dataPriv.set( elem, "hasDataAttrs", true );
    				}
    			}

    			return data;
    		}

    		// Sets multiple values
    		if ( typeof key === "object" ) {
    			return this.each( function() {
    				dataUser.set( this, key );
    			} );
    		}

    		return access( this, function( value ) {
    			var data;

    			// The calling jQuery object (element matches) is not empty
    			// (and therefore has an element appears at this[ 0 ]) and the
    			// `value` parameter was not undefined. An empty jQuery object
    			// will result in `undefined` for elem = this[ 0 ] which will
    			// throw an exception if an attempt to read a data cache is made.
    			if ( elem && value === undefined ) {

    				// Attempt to get data from the cache
    				// The key will always be camelCased in Data
    				data = dataUser.get( elem, key );
    				if ( data !== undefined ) {
    					return data;
    				}

    				// Attempt to "discover" the data in
    				// HTML5 custom data-* attrs
    				data = dataAttr( elem, key );
    				if ( data !== undefined ) {
    					return data;
    				}

    				// We tried really hard, but the data doesn't exist.
    				return;
    			}

    			// Set the data...
    			this.each( function() {

    				// We always store the camelCased key
    				dataUser.set( this, key, value );
    			} );
    		}, null, value, arguments.length > 1, null, true );
    	},

    	removeData: function( key ) {
    		return this.each( function() {
    			dataUser.remove( this, key );
    		} );
    	}
    } );


    jQuery.extend( {
    	queue: function( elem, type, data ) {
    		var queue;

    		if ( elem ) {
    			type = ( type || "fx" ) + "queue";
    			queue = dataPriv.get( elem, type );

    			// Speed up dequeue by getting out quickly if this is just a lookup
    			if ( data ) {
    				if ( !queue || Array.isArray( data ) ) {
    					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
    				} else {
    					queue.push( data );
    				}
    			}
    			return queue || [];
    		}
    	},

    	dequeue: function( elem, type ) {
    		type = type || "fx";

    		var queue = jQuery.queue( elem, type ),
    			startLength = queue.length,
    			fn = queue.shift(),
    			hooks = jQuery._queueHooks( elem, type ),
    			next = function() {
    				jQuery.dequeue( elem, type );
    			};

    		// If the fx queue is dequeued, always remove the progress sentinel
    		if ( fn === "inprogress" ) {
    			fn = queue.shift();
    			startLength--;
    		}

    		if ( fn ) {

    			// Add a progress sentinel to prevent the fx queue from being
    			// automatically dequeued
    			if ( type === "fx" ) {
    				queue.unshift( "inprogress" );
    			}

    			// Clear up the last queue stop function
    			delete hooks.stop;
    			fn.call( elem, next, hooks );
    		}

    		if ( !startLength && hooks ) {
    			hooks.empty.fire();
    		}
    	},

    	// Not public - generate a queueHooks object, or return the current one
    	_queueHooks: function( elem, type ) {
    		var key = type + "queueHooks";
    		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
    			empty: jQuery.Callbacks( "once memory" ).add( function() {
    				dataPriv.remove( elem, [ type + "queue", key ] );
    			} )
    		} );
    	}
    } );

    jQuery.fn.extend( {
    	queue: function( type, data ) {
    		var setter = 2;

    		if ( typeof type !== "string" ) {
    			data = type;
    			type = "fx";
    			setter--;
    		}

    		if ( arguments.length < setter ) {
    			return jQuery.queue( this[ 0 ], type );
    		}

    		return data === undefined ?
    			this :
    			this.each( function() {
    				var queue = jQuery.queue( this, type, data );

    				// Ensure a hooks for this queue
    				jQuery._queueHooks( this, type );

    				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
    					jQuery.dequeue( this, type );
    				}
    			} );
    	},
    	dequeue: function( type ) {
    		return this.each( function() {
    			jQuery.dequeue( this, type );
    		} );
    	},
    	clearQueue: function( type ) {
    		return this.queue( type || "fx", [] );
    	},

    	// Get a promise resolved when queues of a certain type
    	// are emptied (fx is the type by default)
    	promise: function( type, obj ) {
    		var tmp,
    			count = 1,
    			defer = jQuery.Deferred(),
    			elements = this,
    			i = this.length,
    			resolve = function() {
    				if ( !( --count ) ) {
    					defer.resolveWith( elements, [ elements ] );
    				}
    			};

    		if ( typeof type !== "string" ) {
    			obj = type;
    			type = undefined;
    		}
    		type = type || "fx";

    		while ( i-- ) {
    			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
    			if ( tmp && tmp.empty ) {
    				count++;
    				tmp.empty.add( resolve );
    			}
    		}
    		resolve();
    		return defer.promise( obj );
    	}
    } );
    var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

    var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


    var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

    var documentElement = document.documentElement;



    	var isAttached = function( elem ) {
    			return jQuery.contains( elem.ownerDocument, elem );
    		},
    		composed = { composed: true };

    	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
    	// Check attachment across shadow DOM boundaries when possible (gh-3504)
    	// Support: iOS 10.0-10.2 only
    	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
    	// leading to errors. We need to check for `getRootNode`.
    	if ( documentElement.getRootNode ) {
    		isAttached = function( elem ) {
    			return jQuery.contains( elem.ownerDocument, elem ) ||
    				elem.getRootNode( composed ) === elem.ownerDocument;
    		};
    	}
    var isHiddenWithinTree = function( elem, el ) {

    		// isHiddenWithinTree might be called from jQuery#filter function;
    		// in that case, element will be second argument
    		elem = el || elem;

    		// Inline style trumps all
    		return elem.style.display === "none" ||
    			elem.style.display === "" &&

    			// Otherwise, check computed style
    			// Support: Firefox <=43 - 45
    			// Disconnected elements can have computed display: none, so first confirm that elem is
    			// in the document.
    			isAttached( elem ) &&

    			jQuery.css( elem, "display" ) === "none";
    	};



    function adjustCSS( elem, prop, valueParts, tween ) {
    	var adjusted, scale,
    		maxIterations = 20,
    		currentValue = tween ?
    			function() {
    				return tween.cur();
    			} :
    			function() {
    				return jQuery.css( elem, prop, "" );
    			},
    		initial = currentValue(),
    		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

    		// Starting value computation is required for potential unit mismatches
    		initialInUnit = elem.nodeType &&
    			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
    			rcssNum.exec( jQuery.css( elem, prop ) );

    	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

    		// Support: Firefox <=54
    		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
    		initial = initial / 2;

    		// Trust units reported by jQuery.css
    		unit = unit || initialInUnit[ 3 ];

    		// Iteratively approximate from a nonzero starting point
    		initialInUnit = +initial || 1;

    		while ( maxIterations-- ) {

    			// Evaluate and update our best guess (doubling guesses that zero out).
    			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
    			jQuery.style( elem, prop, initialInUnit + unit );
    			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
    				maxIterations = 0;
    			}
    			initialInUnit = initialInUnit / scale;

    		}

    		initialInUnit = initialInUnit * 2;
    		jQuery.style( elem, prop, initialInUnit + unit );

    		// Make sure we update the tween properties later on
    		valueParts = valueParts || [];
    	}

    	if ( valueParts ) {
    		initialInUnit = +initialInUnit || +initial || 0;

    		// Apply relative offset (+=/-=) if specified
    		adjusted = valueParts[ 1 ] ?
    			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
    			+valueParts[ 2 ];
    		if ( tween ) {
    			tween.unit = unit;
    			tween.start = initialInUnit;
    			tween.end = adjusted;
    		}
    	}
    	return adjusted;
    }


    var defaultDisplayMap = {};

    function getDefaultDisplay( elem ) {
    	var temp,
    		doc = elem.ownerDocument,
    		nodeName = elem.nodeName,
    		display = defaultDisplayMap[ nodeName ];

    	if ( display ) {
    		return display;
    	}

    	temp = doc.body.appendChild( doc.createElement( nodeName ) );
    	display = jQuery.css( temp, "display" );

    	temp.parentNode.removeChild( temp );

    	if ( display === "none" ) {
    		display = "block";
    	}
    	defaultDisplayMap[ nodeName ] = display;

    	return display;
    }

    function showHide( elements, show ) {
    	var display, elem,
    		values = [],
    		index = 0,
    		length = elements.length;

    	// Determine new display value for elements that need to change
    	for ( ; index < length; index++ ) {
    		elem = elements[ index ];
    		if ( !elem.style ) {
    			continue;
    		}

    		display = elem.style.display;
    		if ( show ) {

    			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
    			// check is required in this first loop unless we have a nonempty display value (either
    			// inline or about-to-be-restored)
    			if ( display === "none" ) {
    				values[ index ] = dataPriv.get( elem, "display" ) || null;
    				if ( !values[ index ] ) {
    					elem.style.display = "";
    				}
    			}
    			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
    				values[ index ] = getDefaultDisplay( elem );
    			}
    		} else {
    			if ( display !== "none" ) {
    				values[ index ] = "none";

    				// Remember what we're overwriting
    				dataPriv.set( elem, "display", display );
    			}
    		}
    	}

    	// Set the display of the elements in a second loop to avoid constant reflow
    	for ( index = 0; index < length; index++ ) {
    		if ( values[ index ] != null ) {
    			elements[ index ].style.display = values[ index ];
    		}
    	}

    	return elements;
    }

    jQuery.fn.extend( {
    	show: function() {
    		return showHide( this, true );
    	},
    	hide: function() {
    		return showHide( this );
    	},
    	toggle: function( state ) {
    		if ( typeof state === "boolean" ) {
    			return state ? this.show() : this.hide();
    		}

    		return this.each( function() {
    			if ( isHiddenWithinTree( this ) ) {
    				jQuery( this ).show();
    			} else {
    				jQuery( this ).hide();
    			}
    		} );
    	}
    } );
    var rcheckableType = ( /^(?:checkbox|radio)$/i );

    var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

    var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



    ( function() {
    	var fragment = document.createDocumentFragment(),
    		div = fragment.appendChild( document.createElement( "div" ) ),
    		input = document.createElement( "input" );

    	// Support: Android 4.0 - 4.3 only
    	// Check state lost if the name is set (#11217)
    	// Support: Windows Web Apps (WWA)
    	// `name` and `type` must use .setAttribute for WWA (#14901)
    	input.setAttribute( "type", "radio" );
    	input.setAttribute( "checked", "checked" );
    	input.setAttribute( "name", "t" );

    	div.appendChild( input );

    	// Support: Android <=4.1 only
    	// Older WebKit doesn't clone checked state correctly in fragments
    	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

    	// Support: IE <=11 only
    	// Make sure textarea (and checkbox) defaultValue is properly cloned
    	div.innerHTML = "<textarea>x</textarea>";
    	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

    	// Support: IE <=9 only
    	// IE <=9 replaces <option> tags with their contents when inserted outside of
    	// the select element.
    	div.innerHTML = "<option></option>";
    	support.option = !!div.lastChild;
    } )();


    // We have to close these tags to support XHTML (#13200)
    var wrapMap = {

    	// XHTML parsers do not magically insert elements in the
    	// same way that tag soup parsers do. So we cannot shorten
    	// this by omitting <tbody> or other required elements.
    	thead: [ 1, "<table>", "</table>" ],
    	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
    	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

    	_default: [ 0, "", "" ]
    };

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    // Support: IE <=9 only
    if ( !support.option ) {
    	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
    }


    function getAll( context, tag ) {

    	// Support: IE <=9 - 11 only
    	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
    	var ret;

    	if ( typeof context.getElementsByTagName !== "undefined" ) {
    		ret = context.getElementsByTagName( tag || "*" );

    	} else if ( typeof context.querySelectorAll !== "undefined" ) {
    		ret = context.querySelectorAll( tag || "*" );

    	} else {
    		ret = [];
    	}

    	if ( tag === undefined || tag && nodeName( context, tag ) ) {
    		return jQuery.merge( [ context ], ret );
    	}

    	return ret;
    }


    // Mark scripts as having already been evaluated
    function setGlobalEval( elems, refElements ) {
    	var i = 0,
    		l = elems.length;

    	for ( ; i < l; i++ ) {
    		dataPriv.set(
    			elems[ i ],
    			"globalEval",
    			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
    		);
    	}
    }


    var rhtml = /<|&#?\w+;/;

    function buildFragment( elems, context, scripts, selection, ignored ) {
    	var elem, tmp, tag, wrap, attached, j,
    		fragment = context.createDocumentFragment(),
    		nodes = [],
    		i = 0,
    		l = elems.length;

    	for ( ; i < l; i++ ) {
    		elem = elems[ i ];

    		if ( elem || elem === 0 ) {

    			// Add nodes directly
    			if ( toType( elem ) === "object" ) {

    				// Support: Android <=4.0 only, PhantomJS 1 only
    				// push.apply(_, arraylike) throws on ancient WebKit
    				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

    			// Convert non-html into a text node
    			} else if ( !rhtml.test( elem ) ) {
    				nodes.push( context.createTextNode( elem ) );

    			// Convert html into DOM nodes
    			} else {
    				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

    				// Deserialize a standard representation
    				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
    				wrap = wrapMap[ tag ] || wrapMap._default;
    				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

    				// Descend through wrappers to the right content
    				j = wrap[ 0 ];
    				while ( j-- ) {
    					tmp = tmp.lastChild;
    				}

    				// Support: Android <=4.0 only, PhantomJS 1 only
    				// push.apply(_, arraylike) throws on ancient WebKit
    				jQuery.merge( nodes, tmp.childNodes );

    				// Remember the top-level container
    				tmp = fragment.firstChild;

    				// Ensure the created nodes are orphaned (#12392)
    				tmp.textContent = "";
    			}
    		}
    	}

    	// Remove wrapper from fragment
    	fragment.textContent = "";

    	i = 0;
    	while ( ( elem = nodes[ i++ ] ) ) {

    		// Skip elements already in the context collection (trac-4087)
    		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
    			if ( ignored ) {
    				ignored.push( elem );
    			}
    			continue;
    		}

    		attached = isAttached( elem );

    		// Append to fragment
    		tmp = getAll( fragment.appendChild( elem ), "script" );

    		// Preserve script evaluation history
    		if ( attached ) {
    			setGlobalEval( tmp );
    		}

    		// Capture executables
    		if ( scripts ) {
    			j = 0;
    			while ( ( elem = tmp[ j++ ] ) ) {
    				if ( rscriptType.test( elem.type || "" ) ) {
    					scripts.push( elem );
    				}
    			}
    		}
    	}

    	return fragment;
    }


    var
    	rkeyEvent = /^key/,
    	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
    	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

    function returnTrue() {
    	return true;
    }

    function returnFalse() {
    	return false;
    }

    // Support: IE <=9 - 11+
    // focus() and blur() are asynchronous, except when they are no-op.
    // So expect focus to be synchronous when the element is already active,
    // and blur to be synchronous when the element is not already active.
    // (focus and blur are always synchronous in other supported browsers,
    // this just defines when we can count on it).
    function expectSync( elem, type ) {
    	return ( elem === safeActiveElement() ) === ( type === "focus" );
    }

    // Support: IE <=9 only
    // Accessing document.activeElement can throw unexpectedly
    // https://bugs.jquery.com/ticket/13393
    function safeActiveElement() {
    	try {
    		return document.activeElement;
    	} catch ( err ) { }
    }

    function on( elem, types, selector, data, fn, one ) {
    	var origFn, type;

    	// Types can be a map of types/handlers
    	if ( typeof types === "object" ) {

    		// ( types-Object, selector, data )
    		if ( typeof selector !== "string" ) {

    			// ( types-Object, data )
    			data = data || selector;
    			selector = undefined;
    		}
    		for ( type in types ) {
    			on( elem, type, selector, data, types[ type ], one );
    		}
    		return elem;
    	}

    	if ( data == null && fn == null ) {

    		// ( types, fn )
    		fn = selector;
    		data = selector = undefined;
    	} else if ( fn == null ) {
    		if ( typeof selector === "string" ) {

    			// ( types, selector, fn )
    			fn = data;
    			data = undefined;
    		} else {

    			// ( types, data, fn )
    			fn = data;
    			data = selector;
    			selector = undefined;
    		}
    	}
    	if ( fn === false ) {
    		fn = returnFalse;
    	} else if ( !fn ) {
    		return elem;
    	}

    	if ( one === 1 ) {
    		origFn = fn;
    		fn = function( event ) {

    			// Can use an empty set, since event contains the info
    			jQuery().off( event );
    			return origFn.apply( this, arguments );
    		};

    		// Use same guid so caller can remove using origFn
    		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    	}
    	return elem.each( function() {
    		jQuery.event.add( this, types, fn, data, selector );
    	} );
    }

    /*
     * Helper functions for managing events -- not part of the public interface.
     * Props to Dean Edwards' addEvent library for many of the ideas.
     */
    jQuery.event = {

    	global: {},

    	add: function( elem, types, handler, data, selector ) {

    		var handleObjIn, eventHandle, tmp,
    			events, t, handleObj,
    			special, handlers, type, namespaces, origType,
    			elemData = dataPriv.get( elem );

    		// Only attach events to objects that accept data
    		if ( !acceptData( elem ) ) {
    			return;
    		}

    		// Caller can pass in an object of custom data in lieu of the handler
    		if ( handler.handler ) {
    			handleObjIn = handler;
    			handler = handleObjIn.handler;
    			selector = handleObjIn.selector;
    		}

    		// Ensure that invalid selectors throw exceptions at attach time
    		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
    		if ( selector ) {
    			jQuery.find.matchesSelector( documentElement, selector );
    		}

    		// Make sure that the handler has a unique ID, used to find/remove it later
    		if ( !handler.guid ) {
    			handler.guid = jQuery.guid++;
    		}

    		// Init the element's event structure and main handler, if this is the first
    		if ( !( events = elemData.events ) ) {
    			events = elemData.events = Object.create( null );
    		}
    		if ( !( eventHandle = elemData.handle ) ) {
    			eventHandle = elemData.handle = function( e ) {

    				// Discard the second event of a jQuery.event.trigger() and
    				// when an event is called after a page has unloaded
    				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
    					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
    			};
    		}

    		// Handle multiple events separated by a space
    		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
    		t = types.length;
    		while ( t-- ) {
    			tmp = rtypenamespace.exec( types[ t ] ) || [];
    			type = origType = tmp[ 1 ];
    			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

    			// There *must* be a type, no attaching namespace-only handlers
    			if ( !type ) {
    				continue;
    			}

    			// If event changes its type, use the special event handlers for the changed type
    			special = jQuery.event.special[ type ] || {};

    			// If selector defined, determine special event api type, otherwise given type
    			type = ( selector ? special.delegateType : special.bindType ) || type;

    			// Update special based on newly reset type
    			special = jQuery.event.special[ type ] || {};

    			// handleObj is passed to all event handlers
    			handleObj = jQuery.extend( {
    				type: type,
    				origType: origType,
    				data: data,
    				handler: handler,
    				guid: handler.guid,
    				selector: selector,
    				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
    				namespace: namespaces.join( "." )
    			}, handleObjIn );

    			// Init the event handler queue if we're the first
    			if ( !( handlers = events[ type ] ) ) {
    				handlers = events[ type ] = [];
    				handlers.delegateCount = 0;

    				// Only use addEventListener if the special events handler returns false
    				if ( !special.setup ||
    					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

    					if ( elem.addEventListener ) {
    						elem.addEventListener( type, eventHandle );
    					}
    				}
    			}

    			if ( special.add ) {
    				special.add.call( elem, handleObj );

    				if ( !handleObj.handler.guid ) {
    					handleObj.handler.guid = handler.guid;
    				}
    			}

    			// Add to the element's handler list, delegates in front
    			if ( selector ) {
    				handlers.splice( handlers.delegateCount++, 0, handleObj );
    			} else {
    				handlers.push( handleObj );
    			}

    			// Keep track of which events have ever been used, for event optimization
    			jQuery.event.global[ type ] = true;
    		}

    	},

    	// Detach an event or set of events from an element
    	remove: function( elem, types, handler, selector, mappedTypes ) {

    		var j, origCount, tmp,
    			events, t, handleObj,
    			special, handlers, type, namespaces, origType,
    			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

    		if ( !elemData || !( events = elemData.events ) ) {
    			return;
    		}

    		// Once for each type.namespace in types; type may be omitted
    		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
    		t = types.length;
    		while ( t-- ) {
    			tmp = rtypenamespace.exec( types[ t ] ) || [];
    			type = origType = tmp[ 1 ];
    			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

    			// Unbind all events (on this namespace, if provided) for the element
    			if ( !type ) {
    				for ( type in events ) {
    					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
    				}
    				continue;
    			}

    			special = jQuery.event.special[ type ] || {};
    			type = ( selector ? special.delegateType : special.bindType ) || type;
    			handlers = events[ type ] || [];
    			tmp = tmp[ 2 ] &&
    				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

    			// Remove matching events
    			origCount = j = handlers.length;
    			while ( j-- ) {
    				handleObj = handlers[ j ];

    				if ( ( mappedTypes || origType === handleObj.origType ) &&
    					( !handler || handler.guid === handleObj.guid ) &&
    					( !tmp || tmp.test( handleObj.namespace ) ) &&
    					( !selector || selector === handleObj.selector ||
    						selector === "**" && handleObj.selector ) ) {
    					handlers.splice( j, 1 );

    					if ( handleObj.selector ) {
    						handlers.delegateCount--;
    					}
    					if ( special.remove ) {
    						special.remove.call( elem, handleObj );
    					}
    				}
    			}

    			// Remove generic event handler if we removed something and no more handlers exist
    			// (avoids potential for endless recursion during removal of special event handlers)
    			if ( origCount && !handlers.length ) {
    				if ( !special.teardown ||
    					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

    					jQuery.removeEvent( elem, type, elemData.handle );
    				}

    				delete events[ type ];
    			}
    		}

    		// Remove data and the expando if it's no longer used
    		if ( jQuery.isEmptyObject( events ) ) {
    			dataPriv.remove( elem, "handle events" );
    		}
    	},

    	dispatch: function( nativeEvent ) {

    		var i, j, ret, matched, handleObj, handlerQueue,
    			args = new Array( arguments.length ),

    			// Make a writable jQuery.Event from the native event object
    			event = jQuery.event.fix( nativeEvent ),

    			handlers = (
    					dataPriv.get( this, "events" ) || Object.create( null )
    				)[ event.type ] || [],
    			special = jQuery.event.special[ event.type ] || {};

    		// Use the fix-ed jQuery.Event rather than the (read-only) native event
    		args[ 0 ] = event;

    		for ( i = 1; i < arguments.length; i++ ) {
    			args[ i ] = arguments[ i ];
    		}

    		event.delegateTarget = this;

    		// Call the preDispatch hook for the mapped type, and let it bail if desired
    		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
    			return;
    		}

    		// Determine handlers
    		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

    		// Run delegates first; they may want to stop propagation beneath us
    		i = 0;
    		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
    			event.currentTarget = matched.elem;

    			j = 0;
    			while ( ( handleObj = matched.handlers[ j++ ] ) &&
    				!event.isImmediatePropagationStopped() ) {

    				// If the event is namespaced, then each handler is only invoked if it is
    				// specially universal or its namespaces are a superset of the event's.
    				if ( !event.rnamespace || handleObj.namespace === false ||
    					event.rnamespace.test( handleObj.namespace ) ) {

    					event.handleObj = handleObj;
    					event.data = handleObj.data;

    					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
    						handleObj.handler ).apply( matched.elem, args );

    					if ( ret !== undefined ) {
    						if ( ( event.result = ret ) === false ) {
    							event.preventDefault();
    							event.stopPropagation();
    						}
    					}
    				}
    			}
    		}

    		// Call the postDispatch hook for the mapped type
    		if ( special.postDispatch ) {
    			special.postDispatch.call( this, event );
    		}

    		return event.result;
    	},

    	handlers: function( event, handlers ) {
    		var i, handleObj, sel, matchedHandlers, matchedSelectors,
    			handlerQueue = [],
    			delegateCount = handlers.delegateCount,
    			cur = event.target;

    		// Find delegate handlers
    		if ( delegateCount &&

    			// Support: IE <=9
    			// Black-hole SVG <use> instance trees (trac-13180)
    			cur.nodeType &&

    			// Support: Firefox <=42
    			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
    			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
    			// Support: IE 11 only
    			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
    			!( event.type === "click" && event.button >= 1 ) ) {

    			for ( ; cur !== this; cur = cur.parentNode || this ) {

    				// Don't check non-elements (#13208)
    				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
    				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
    					matchedHandlers = [];
    					matchedSelectors = {};
    					for ( i = 0; i < delegateCount; i++ ) {
    						handleObj = handlers[ i ];

    						// Don't conflict with Object.prototype properties (#13203)
    						sel = handleObj.selector + " ";

    						if ( matchedSelectors[ sel ] === undefined ) {
    							matchedSelectors[ sel ] = handleObj.needsContext ?
    								jQuery( sel, this ).index( cur ) > -1 :
    								jQuery.find( sel, this, null, [ cur ] ).length;
    						}
    						if ( matchedSelectors[ sel ] ) {
    							matchedHandlers.push( handleObj );
    						}
    					}
    					if ( matchedHandlers.length ) {
    						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
    					}
    				}
    			}
    		}

    		// Add the remaining (directly-bound) handlers
    		cur = this;
    		if ( delegateCount < handlers.length ) {
    			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
    		}

    		return handlerQueue;
    	},

    	addProp: function( name, hook ) {
    		Object.defineProperty( jQuery.Event.prototype, name, {
    			enumerable: true,
    			configurable: true,

    			get: isFunction( hook ) ?
    				function() {
    					if ( this.originalEvent ) {
    							return hook( this.originalEvent );
    					}
    				} :
    				function() {
    					if ( this.originalEvent ) {
    							return this.originalEvent[ name ];
    					}
    				},

    			set: function( value ) {
    				Object.defineProperty( this, name, {
    					enumerable: true,
    					configurable: true,
    					writable: true,
    					value: value
    				} );
    			}
    		} );
    	},

    	fix: function( originalEvent ) {
    		return originalEvent[ jQuery.expando ] ?
    			originalEvent :
    			new jQuery.Event( originalEvent );
    	},

    	special: {
    		load: {

    			// Prevent triggered image.load events from bubbling to window.load
    			noBubble: true
    		},
    		click: {

    			// Utilize native event to ensure correct state for checkable inputs
    			setup: function( data ) {

    				// For mutual compressibility with _default, replace `this` access with a local var.
    				// `|| data` is dead code meant only to preserve the variable through minification.
    				var el = this || data;

    				// Claim the first handler
    				if ( rcheckableType.test( el.type ) &&
    					el.click && nodeName( el, "input" ) ) {

    					// dataPriv.set( el, "click", ... )
    					leverageNative( el, "click", returnTrue );
    				}

    				// Return false to allow normal processing in the caller
    				return false;
    			},
    			trigger: function( data ) {

    				// For mutual compressibility with _default, replace `this` access with a local var.
    				// `|| data` is dead code meant only to preserve the variable through minification.
    				var el = this || data;

    				// Force setup before triggering a click
    				if ( rcheckableType.test( el.type ) &&
    					el.click && nodeName( el, "input" ) ) {

    					leverageNative( el, "click" );
    				}

    				// Return non-false to allow normal event-path propagation
    				return true;
    			},

    			// For cross-browser consistency, suppress native .click() on links
    			// Also prevent it if we're currently inside a leveraged native-event stack
    			_default: function( event ) {
    				var target = event.target;
    				return rcheckableType.test( target.type ) &&
    					target.click && nodeName( target, "input" ) &&
    					dataPriv.get( target, "click" ) ||
    					nodeName( target, "a" );
    			}
    		},

    		beforeunload: {
    			postDispatch: function( event ) {

    				// Support: Firefox 20+
    				// Firefox doesn't alert if the returnValue field is not set.
    				if ( event.result !== undefined && event.originalEvent ) {
    					event.originalEvent.returnValue = event.result;
    				}
    			}
    		}
    	}
    };

    // Ensure the presence of an event listener that handles manually-triggered
    // synthetic events by interrupting progress until reinvoked in response to
    // *native* events that it fires directly, ensuring that state changes have
    // already occurred before other listeners are invoked.
    function leverageNative( el, type, expectSync ) {

    	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
    	if ( !expectSync ) {
    		if ( dataPriv.get( el, type ) === undefined ) {
    			jQuery.event.add( el, type, returnTrue );
    		}
    		return;
    	}

    	// Register the controller as a special universal handler for all event namespaces
    	dataPriv.set( el, type, false );
    	jQuery.event.add( el, type, {
    		namespace: false,
    		handler: function( event ) {
    			var notAsync, result,
    				saved = dataPriv.get( this, type );

    			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

    				// Interrupt processing of the outer synthetic .trigger()ed event
    				// Saved data should be false in such cases, but might be a leftover capture object
    				// from an async native handler (gh-4350)
    				if ( !saved.length ) {

    					// Store arguments for use when handling the inner native event
    					// There will always be at least one argument (an event object), so this array
    					// will not be confused with a leftover capture object.
    					saved = slice.call( arguments );
    					dataPriv.set( this, type, saved );

    					// Trigger the native event and capture its result
    					// Support: IE <=9 - 11+
    					// focus() and blur() are asynchronous
    					notAsync = expectSync( this, type );
    					this[ type ]();
    					result = dataPriv.get( this, type );
    					if ( saved !== result || notAsync ) {
    						dataPriv.set( this, type, false );
    					} else {
    						result = {};
    					}
    					if ( saved !== result ) {

    						// Cancel the outer synthetic event
    						event.stopImmediatePropagation();
    						event.preventDefault();
    						return result.value;
    					}

    				// If this is an inner synthetic event for an event with a bubbling surrogate
    				// (focus or blur), assume that the surrogate already propagated from triggering the
    				// native event and prevent that from happening again here.
    				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
    				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
    				// less bad than duplication.
    				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
    					event.stopPropagation();
    				}

    			// If this is a native event triggered above, everything is now in order
    			// Fire an inner synthetic event with the original arguments
    			} else if ( saved.length ) {

    				// ...and capture the result
    				dataPriv.set( this, type, {
    					value: jQuery.event.trigger(

    						// Support: IE <=9 - 11+
    						// Extend with the prototype to reset the above stopImmediatePropagation()
    						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
    						saved.slice( 1 ),
    						this
    					)
    				} );

    				// Abort handling of the native event
    				event.stopImmediatePropagation();
    			}
    		}
    	} );
    }

    jQuery.removeEvent = function( elem, type, handle ) {

    	// This "if" is needed for plain objects
    	if ( elem.removeEventListener ) {
    		elem.removeEventListener( type, handle );
    	}
    };

    jQuery.Event = function( src, props ) {

    	// Allow instantiation without the 'new' keyword
    	if ( !( this instanceof jQuery.Event ) ) {
    		return new jQuery.Event( src, props );
    	}

    	// Event object
    	if ( src && src.type ) {
    		this.originalEvent = src;
    		this.type = src.type;

    		// Events bubbling up the document may have been marked as prevented
    		// by a handler lower down the tree; reflect the correct value.
    		this.isDefaultPrevented = src.defaultPrevented ||
    				src.defaultPrevented === undefined &&

    				// Support: Android <=2.3 only
    				src.returnValue === false ?
    			returnTrue :
    			returnFalse;

    		// Create target properties
    		// Support: Safari <=6 - 7 only
    		// Target should not be a text node (#504, #13143)
    		this.target = ( src.target && src.target.nodeType === 3 ) ?
    			src.target.parentNode :
    			src.target;

    		this.currentTarget = src.currentTarget;
    		this.relatedTarget = src.relatedTarget;

    	// Event type
    	} else {
    		this.type = src;
    	}

    	// Put explicitly provided properties onto the event object
    	if ( props ) {
    		jQuery.extend( this, props );
    	}

    	// Create a timestamp if incoming event doesn't have one
    	this.timeStamp = src && src.timeStamp || Date.now();

    	// Mark it as fixed
    	this[ jQuery.expando ] = true;
    };

    // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
    	constructor: jQuery.Event,
    	isDefaultPrevented: returnFalse,
    	isPropagationStopped: returnFalse,
    	isImmediatePropagationStopped: returnFalse,
    	isSimulated: false,

    	preventDefault: function() {
    		var e = this.originalEvent;

    		this.isDefaultPrevented = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.preventDefault();
    		}
    	},
    	stopPropagation: function() {
    		var e = this.originalEvent;

    		this.isPropagationStopped = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.stopPropagation();
    		}
    	},
    	stopImmediatePropagation: function() {
    		var e = this.originalEvent;

    		this.isImmediatePropagationStopped = returnTrue;

    		if ( e && !this.isSimulated ) {
    			e.stopImmediatePropagation();
    		}

    		this.stopPropagation();
    	}
    };

    // Includes all common event props including KeyEvent and MouseEvent specific props
    jQuery.each( {
    	altKey: true,
    	bubbles: true,
    	cancelable: true,
    	changedTouches: true,
    	ctrlKey: true,
    	detail: true,
    	eventPhase: true,
    	metaKey: true,
    	pageX: true,
    	pageY: true,
    	shiftKey: true,
    	view: true,
    	"char": true,
    	code: true,
    	charCode: true,
    	key: true,
    	keyCode: true,
    	button: true,
    	buttons: true,
    	clientX: true,
    	clientY: true,
    	offsetX: true,
    	offsetY: true,
    	pointerId: true,
    	pointerType: true,
    	screenX: true,
    	screenY: true,
    	targetTouches: true,
    	toElement: true,
    	touches: true,

    	which: function( event ) {
    		var button = event.button;

    		// Add which for key events
    		if ( event.which == null && rkeyEvent.test( event.type ) ) {
    			return event.charCode != null ? event.charCode : event.keyCode;
    		}

    		// Add which for click: 1 === left; 2 === middle; 3 === right
    		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
    			if ( button & 1 ) {
    				return 1;
    			}

    			if ( button & 2 ) {
    				return 3;
    			}

    			if ( button & 4 ) {
    				return 2;
    			}

    			return 0;
    		}

    		return event.which;
    	}
    }, jQuery.event.addProp );

    jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
    	jQuery.event.special[ type ] = {

    		// Utilize native event if possible so blur/focus sequence is correct
    		setup: function() {

    			// Claim the first handler
    			// dataPriv.set( this, "focus", ... )
    			// dataPriv.set( this, "blur", ... )
    			leverageNative( this, type, expectSync );

    			// Return false to allow normal processing in the caller
    			return false;
    		},
    		trigger: function() {

    			// Force setup before trigger
    			leverageNative( this, type );

    			// Return non-false to allow normal event-path propagation
    			return true;
    		},

    		delegateType: delegateType
    	};
    } );

    // Create mouseenter/leave events using mouseover/out and event-time checks
    // so that event delegation works in jQuery.
    // Do the same for pointerenter/pointerleave and pointerover/pointerout
    //
    // Support: Safari 7 only
    // Safari sends mouseenter too often; see:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=470258
    // for the description of the bug (it existed in older Chrome versions as well).
    jQuery.each( {
    	mouseenter: "mouseover",
    	mouseleave: "mouseout",
    	pointerenter: "pointerover",
    	pointerleave: "pointerout"
    }, function( orig, fix ) {
    	jQuery.event.special[ orig ] = {
    		delegateType: fix,
    		bindType: fix,

    		handle: function( event ) {
    			var ret,
    				target = this,
    				related = event.relatedTarget,
    				handleObj = event.handleObj;

    			// For mouseenter/leave call the handler if related is outside the target.
    			// NB: No relatedTarget if the mouse left/entered the browser window
    			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
    				event.type = handleObj.origType;
    				ret = handleObj.handler.apply( this, arguments );
    				event.type = fix;
    			}
    			return ret;
    		}
    	};
    } );

    jQuery.fn.extend( {

    	on: function( types, selector, data, fn ) {
    		return on( this, types, selector, data, fn );
    	},
    	one: function( types, selector, data, fn ) {
    		return on( this, types, selector, data, fn, 1 );
    	},
    	off: function( types, selector, fn ) {
    		var handleObj, type;
    		if ( types && types.preventDefault && types.handleObj ) {

    			// ( event )  dispatched jQuery.Event
    			handleObj = types.handleObj;
    			jQuery( types.delegateTarget ).off(
    				handleObj.namespace ?
    					handleObj.origType + "." + handleObj.namespace :
    					handleObj.origType,
    				handleObj.selector,
    				handleObj.handler
    			);
    			return this;
    		}
    		if ( typeof types === "object" ) {

    			// ( types-object [, selector] )
    			for ( type in types ) {
    				this.off( type, selector, types[ type ] );
    			}
    			return this;
    		}
    		if ( selector === false || typeof selector === "function" ) {

    			// ( types [, fn] )
    			fn = selector;
    			selector = undefined;
    		}
    		if ( fn === false ) {
    			fn = returnFalse;
    		}
    		return this.each( function() {
    			jQuery.event.remove( this, types, fn, selector );
    		} );
    	}
    } );


    var

    	// Support: IE <=10 - 11, Edge 12 - 13 only
    	// In IE/Edge using regex groups here causes severe slowdowns.
    	// See https://connect.microsoft.com/IE/feedback/details/1736512/
    	rnoInnerhtml = /<script|<style|<link/i,

    	// checked="checked" or checked
    	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
    	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

    // Prefer a tbody over its parent table for containing new rows
    function manipulationTarget( elem, content ) {
    	if ( nodeName( elem, "table" ) &&
    		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

    		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
    	}

    	return elem;
    }

    // Replace/restore the type attribute of script elements for safe DOM manipulation
    function disableScript( elem ) {
    	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
    	return elem;
    }
    function restoreScript( elem ) {
    	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
    		elem.type = elem.type.slice( 5 );
    	} else {
    		elem.removeAttribute( "type" );
    	}

    	return elem;
    }

    function cloneCopyEvent( src, dest ) {
    	var i, l, type, pdataOld, udataOld, udataCur, events;

    	if ( dest.nodeType !== 1 ) {
    		return;
    	}

    	// 1. Copy private data: events, handlers, etc.
    	if ( dataPriv.hasData( src ) ) {
    		pdataOld = dataPriv.get( src );
    		events = pdataOld.events;

    		if ( events ) {
    			dataPriv.remove( dest, "handle events" );

    			for ( type in events ) {
    				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
    					jQuery.event.add( dest, type, events[ type ][ i ] );
    				}
    			}
    		}
    	}

    	// 2. Copy user data
    	if ( dataUser.hasData( src ) ) {
    		udataOld = dataUser.access( src );
    		udataCur = jQuery.extend( {}, udataOld );

    		dataUser.set( dest, udataCur );
    	}
    }

    // Fix IE bugs, see support tests
    function fixInput( src, dest ) {
    	var nodeName = dest.nodeName.toLowerCase();

    	// Fails to persist the checked state of a cloned checkbox or radio button.
    	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
    		dest.checked = src.checked;

    	// Fails to return the selected option to the default selected state when cloning options
    	} else if ( nodeName === "input" || nodeName === "textarea" ) {
    		dest.defaultValue = src.defaultValue;
    	}
    }

    function domManip( collection, args, callback, ignored ) {

    	// Flatten any nested arrays
    	args = flat( args );

    	var fragment, first, scripts, hasScripts, node, doc,
    		i = 0,
    		l = collection.length,
    		iNoClone = l - 1,
    		value = args[ 0 ],
    		valueIsFunction = isFunction( value );

    	// We can't cloneNode fragments that contain checked, in WebKit
    	if ( valueIsFunction ||
    			( l > 1 && typeof value === "string" &&
    				!support.checkClone && rchecked.test( value ) ) ) {
    		return collection.each( function( index ) {
    			var self = collection.eq( index );
    			if ( valueIsFunction ) {
    				args[ 0 ] = value.call( this, index, self.html() );
    			}
    			domManip( self, args, callback, ignored );
    		} );
    	}

    	if ( l ) {
    		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
    		first = fragment.firstChild;

    		if ( fragment.childNodes.length === 1 ) {
    			fragment = first;
    		}

    		// Require either new content or an interest in ignored elements to invoke the callback
    		if ( first || ignored ) {
    			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
    			hasScripts = scripts.length;

    			// Use the original fragment for the last item
    			// instead of the first because it can end up
    			// being emptied incorrectly in certain situations (#8070).
    			for ( ; i < l; i++ ) {
    				node = fragment;

    				if ( i !== iNoClone ) {
    					node = jQuery.clone( node, true, true );

    					// Keep references to cloned scripts for later restoration
    					if ( hasScripts ) {

    						// Support: Android <=4.0 only, PhantomJS 1 only
    						// push.apply(_, arraylike) throws on ancient WebKit
    						jQuery.merge( scripts, getAll( node, "script" ) );
    					}
    				}

    				callback.call( collection[ i ], node, i );
    			}

    			if ( hasScripts ) {
    				doc = scripts[ scripts.length - 1 ].ownerDocument;

    				// Reenable scripts
    				jQuery.map( scripts, restoreScript );

    				// Evaluate executable scripts on first document insertion
    				for ( i = 0; i < hasScripts; i++ ) {
    					node = scripts[ i ];
    					if ( rscriptType.test( node.type || "" ) &&
    						!dataPriv.access( node, "globalEval" ) &&
    						jQuery.contains( doc, node ) ) {

    						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

    							// Optional AJAX dependency, but won't run scripts if not present
    							if ( jQuery._evalUrl && !node.noModule ) {
    								jQuery._evalUrl( node.src, {
    									nonce: node.nonce || node.getAttribute( "nonce" )
    								}, doc );
    							}
    						} else {
    							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
    						}
    					}
    				}
    			}
    		}
    	}

    	return collection;
    }

    function remove( elem, selector, keepData ) {
    	var node,
    		nodes = selector ? jQuery.filter( selector, elem ) : elem,
    		i = 0;

    	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
    		if ( !keepData && node.nodeType === 1 ) {
    			jQuery.cleanData( getAll( node ) );
    		}

    		if ( node.parentNode ) {
    			if ( keepData && isAttached( node ) ) {
    				setGlobalEval( getAll( node, "script" ) );
    			}
    			node.parentNode.removeChild( node );
    		}
    	}

    	return elem;
    }

    jQuery.extend( {
    	htmlPrefilter: function( html ) {
    		return html;
    	},

    	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    		var i, l, srcElements, destElements,
    			clone = elem.cloneNode( true ),
    			inPage = isAttached( elem );

    		// Fix IE cloning issues
    		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
    				!jQuery.isXMLDoc( elem ) ) {

    			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
    			destElements = getAll( clone );
    			srcElements = getAll( elem );

    			for ( i = 0, l = srcElements.length; i < l; i++ ) {
    				fixInput( srcElements[ i ], destElements[ i ] );
    			}
    		}

    		// Copy the events from the original to the clone
    		if ( dataAndEvents ) {
    			if ( deepDataAndEvents ) {
    				srcElements = srcElements || getAll( elem );
    				destElements = destElements || getAll( clone );

    				for ( i = 0, l = srcElements.length; i < l; i++ ) {
    					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
    				}
    			} else {
    				cloneCopyEvent( elem, clone );
    			}
    		}

    		// Preserve script evaluation history
    		destElements = getAll( clone, "script" );
    		if ( destElements.length > 0 ) {
    			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
    		}

    		// Return the cloned set
    		return clone;
    	},

    	cleanData: function( elems ) {
    		var data, elem, type,
    			special = jQuery.event.special,
    			i = 0;

    		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
    			if ( acceptData( elem ) ) {
    				if ( ( data = elem[ dataPriv.expando ] ) ) {
    					if ( data.events ) {
    						for ( type in data.events ) {
    							if ( special[ type ] ) {
    								jQuery.event.remove( elem, type );

    							// This is a shortcut to avoid jQuery.event.remove's overhead
    							} else {
    								jQuery.removeEvent( elem, type, data.handle );
    							}
    						}
    					}

    					// Support: Chrome <=35 - 45+
    					// Assign undefined instead of using delete, see Data#remove
    					elem[ dataPriv.expando ] = undefined;
    				}
    				if ( elem[ dataUser.expando ] ) {

    					// Support: Chrome <=35 - 45+
    					// Assign undefined instead of using delete, see Data#remove
    					elem[ dataUser.expando ] = undefined;
    				}
    			}
    		}
    	}
    } );

    jQuery.fn.extend( {
    	detach: function( selector ) {
    		return remove( this, selector, true );
    	},

    	remove: function( selector ) {
    		return remove( this, selector );
    	},

    	text: function( value ) {
    		return access( this, function( value ) {
    			return value === undefined ?
    				jQuery.text( this ) :
    				this.empty().each( function() {
    					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    						this.textContent = value;
    					}
    				} );
    		}, null, value, arguments.length );
    	},

    	append: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    				var target = manipulationTarget( this, elem );
    				target.appendChild( elem );
    			}
    		} );
    	},

    	prepend: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
    				var target = manipulationTarget( this, elem );
    				target.insertBefore( elem, target.firstChild );
    			}
    		} );
    	},

    	before: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.parentNode ) {
    				this.parentNode.insertBefore( elem, this );
    			}
    		} );
    	},

    	after: function() {
    		return domManip( this, arguments, function( elem ) {
    			if ( this.parentNode ) {
    				this.parentNode.insertBefore( elem, this.nextSibling );
    			}
    		} );
    	},

    	empty: function() {
    		var elem,
    			i = 0;

    		for ( ; ( elem = this[ i ] ) != null; i++ ) {
    			if ( elem.nodeType === 1 ) {

    				// Prevent memory leaks
    				jQuery.cleanData( getAll( elem, false ) );

    				// Remove any remaining nodes
    				elem.textContent = "";
    			}
    		}

    		return this;
    	},

    	clone: function( dataAndEvents, deepDataAndEvents ) {
    		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    		return this.map( function() {
    			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    		} );
    	},

    	html: function( value ) {
    		return access( this, function( value ) {
    			var elem = this[ 0 ] || {},
    				i = 0,
    				l = this.length;

    			if ( value === undefined && elem.nodeType === 1 ) {
    				return elem.innerHTML;
    			}

    			// See if we can take a shortcut and just use innerHTML
    			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
    				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

    				value = jQuery.htmlPrefilter( value );

    				try {
    					for ( ; i < l; i++ ) {
    						elem = this[ i ] || {};

    						// Remove element nodes and prevent memory leaks
    						if ( elem.nodeType === 1 ) {
    							jQuery.cleanData( getAll( elem, false ) );
    							elem.innerHTML = value;
    						}
    					}

    					elem = 0;

    				// If using innerHTML throws an exception, use the fallback method
    				} catch ( e ) {}
    			}

    			if ( elem ) {
    				this.empty().append( value );
    			}
    		}, null, value, arguments.length );
    	},

    	replaceWith: function() {
    		var ignored = [];

    		// Make the changes, replacing each non-ignored context element with the new content
    		return domManip( this, arguments, function( elem ) {
    			var parent = this.parentNode;

    			if ( jQuery.inArray( this, ignored ) < 0 ) {
    				jQuery.cleanData( getAll( this ) );
    				if ( parent ) {
    					parent.replaceChild( elem, this );
    				}
    			}

    		// Force callback invocation
    		}, ignored );
    	}
    } );

    jQuery.each( {
    	appendTo: "append",
    	prependTo: "prepend",
    	insertBefore: "before",
    	insertAfter: "after",
    	replaceAll: "replaceWith"
    }, function( name, original ) {
    	jQuery.fn[ name ] = function( selector ) {
    		var elems,
    			ret = [],
    			insert = jQuery( selector ),
    			last = insert.length - 1,
    			i = 0;

    		for ( ; i <= last; i++ ) {
    			elems = i === last ? this : this.clone( true );
    			jQuery( insert[ i ] )[ original ]( elems );

    			// Support: Android <=4.0 only, PhantomJS 1 only
    			// .get() because push.apply(_, arraylike) throws on ancient WebKit
    			push.apply( ret, elems.get() );
    		}

    		return this.pushStack( ret );
    	};
    } );
    var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

    var getStyles = function( elem ) {

    		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
    		// IE throws on elements created in popups
    		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
    		var view = elem.ownerDocument.defaultView;

    		if ( !view || !view.opener ) {
    			view = window;
    		}

    		return view.getComputedStyle( elem );
    	};

    var swap = function( elem, options, callback ) {
    	var ret, name,
    		old = {};

    	// Remember the old values, and insert the new ones
    	for ( name in options ) {
    		old[ name ] = elem.style[ name ];
    		elem.style[ name ] = options[ name ];
    	}

    	ret = callback.call( elem );

    	// Revert the old values
    	for ( name in options ) {
    		elem.style[ name ] = old[ name ];
    	}

    	return ret;
    };


    var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



    ( function() {

    	// Executing both pixelPosition & boxSizingReliable tests require only one layout
    	// so they're executed at the same time to save the second computation.
    	function computeStyleTests() {

    		// This is a singleton, we need to execute it only once
    		if ( !div ) {
    			return;
    		}

    		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
    			"margin-top:1px;padding:0;border:0";
    		div.style.cssText =
    			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
    			"margin:auto;border:1px;padding:1px;" +
    			"width:60%;top:1%";
    		documentElement.appendChild( container ).appendChild( div );

    		var divStyle = window.getComputedStyle( div );
    		pixelPositionVal = divStyle.top !== "1%";

    		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
    		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

    		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
    		// Some styles come back with percentage values, even though they shouldn't
    		div.style.right = "60%";
    		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

    		// Support: IE 9 - 11 only
    		// Detect misreporting of content dimensions for box-sizing:border-box elements
    		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

    		// Support: IE 9 only
    		// Detect overflow:scroll screwiness (gh-3699)
    		// Support: Chrome <=64
    		// Don't get tricked when zoom affects offsetWidth (gh-4029)
    		div.style.position = "absolute";
    		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

    		documentElement.removeChild( container );

    		// Nullify the div so it wouldn't be stored in the memory and
    		// it will also be a sign that checks already performed
    		div = null;
    	}

    	function roundPixelMeasures( measure ) {
    		return Math.round( parseFloat( measure ) );
    	}

    	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
    		reliableTrDimensionsVal, reliableMarginLeftVal,
    		container = document.createElement( "div" ),
    		div = document.createElement( "div" );

    	// Finish early in limited (non-browser) environments
    	if ( !div.style ) {
    		return;
    	}

    	// Support: IE <=9 - 11 only
    	// Style of cloned element affects source element cloned (#8908)
    	div.style.backgroundClip = "content-box";
    	div.cloneNode( true ).style.backgroundClip = "";
    	support.clearCloneStyle = div.style.backgroundClip === "content-box";

    	jQuery.extend( support, {
    		boxSizingReliable: function() {
    			computeStyleTests();
    			return boxSizingReliableVal;
    		},
    		pixelBoxStyles: function() {
    			computeStyleTests();
    			return pixelBoxStylesVal;
    		},
    		pixelPosition: function() {
    			computeStyleTests();
    			return pixelPositionVal;
    		},
    		reliableMarginLeft: function() {
    			computeStyleTests();
    			return reliableMarginLeftVal;
    		},
    		scrollboxSize: function() {
    			computeStyleTests();
    			return scrollboxSizeVal;
    		},

    		// Support: IE 9 - 11+, Edge 15 - 18+
    		// IE/Edge misreport `getComputedStyle` of table rows with width/height
    		// set in CSS while `offset*` properties report correct values.
    		// Behavior in IE 9 is more subtle than in newer versions & it passes
    		// some versions of this test; make sure not to make it pass there!
    		reliableTrDimensions: function() {
    			var table, tr, trChild, trStyle;
    			if ( reliableTrDimensionsVal == null ) {
    				table = document.createElement( "table" );
    				tr = document.createElement( "tr" );
    				trChild = document.createElement( "div" );

    				table.style.cssText = "position:absolute;left:-11111px";
    				tr.style.height = "1px";
    				trChild.style.height = "9px";

    				documentElement
    					.appendChild( table )
    					.appendChild( tr )
    					.appendChild( trChild );

    				trStyle = window.getComputedStyle( tr );
    				reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

    				documentElement.removeChild( table );
    			}
    			return reliableTrDimensionsVal;
    		}
    	} );
    } )();


    function curCSS( elem, name, computed ) {
    	var width, minWidth, maxWidth, ret,

    		// Support: Firefox 51+
    		// Retrieving style before computed somehow
    		// fixes an issue with getting wrong values
    		// on detached elements
    		style = elem.style;

    	computed = computed || getStyles( elem );

    	// getPropertyValue is needed for:
    	//   .css('filter') (IE 9 only, #12537)
    	//   .css('--customProperty) (#3144)
    	if ( computed ) {
    		ret = computed.getPropertyValue( name ) || computed[ name ];

    		if ( ret === "" && !isAttached( elem ) ) {
    			ret = jQuery.style( elem, name );
    		}

    		// A tribute to the "awesome hack by Dean Edwards"
    		// Android Browser returns percentage for some values,
    		// but width seems to be reliably pixels.
    		// This is against the CSSOM draft spec:
    		// https://drafts.csswg.org/cssom/#resolved-values
    		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

    			// Remember the original values
    			width = style.width;
    			minWidth = style.minWidth;
    			maxWidth = style.maxWidth;

    			// Put in the new values to get a computed value out
    			style.minWidth = style.maxWidth = style.width = ret;
    			ret = computed.width;

    			// Revert the changed values
    			style.width = width;
    			style.minWidth = minWidth;
    			style.maxWidth = maxWidth;
    		}
    	}

    	return ret !== undefined ?

    		// Support: IE <=9 - 11 only
    		// IE returns zIndex value as an integer.
    		ret + "" :
    		ret;
    }


    function addGetHookIf( conditionFn, hookFn ) {

    	// Define the hook, we'll check on the first run if it's really needed.
    	return {
    		get: function() {
    			if ( conditionFn() ) {

    				// Hook not needed (or it's not possible to use it due
    				// to missing dependency), remove it.
    				delete this.get;
    				return;
    			}

    			// Hook needed; redefine it so that the support test is not executed again.
    			return ( this.get = hookFn ).apply( this, arguments );
    		}
    	};
    }


    var cssPrefixes = [ "Webkit", "Moz", "ms" ],
    	emptyStyle = document.createElement( "div" ).style,
    	vendorProps = {};

    // Return a vendor-prefixed property or undefined
    function vendorPropName( name ) {

    	// Check for vendor prefixed names
    	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
    		i = cssPrefixes.length;

    	while ( i-- ) {
    		name = cssPrefixes[ i ] + capName;
    		if ( name in emptyStyle ) {
    			return name;
    		}
    	}
    }

    // Return a potentially-mapped jQuery.cssProps or vendor prefixed property
    function finalPropName( name ) {
    	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

    	if ( final ) {
    		return final;
    	}
    	if ( name in emptyStyle ) {
    		return name;
    	}
    	return vendorProps[ name ] = vendorPropName( name ) || name;
    }


    var

    	// Swappable if display is none or starts with table
    	// except "table", "table-cell", or "table-caption"
    	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    	rcustomProp = /^--/,
    	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
    	cssNormalTransform = {
    		letterSpacing: "0",
    		fontWeight: "400"
    	};

    function setPositiveNumber( _elem, value, subtract ) {

    	// Any relative (+/-) values have already been
    	// normalized at this point
    	var matches = rcssNum.exec( value );
    	return matches ?

    		// Guard against undefined "subtract", e.g., when used as in cssHooks
    		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
    		value;
    }

    function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
    	var i = dimension === "width" ? 1 : 0,
    		extra = 0,
    		delta = 0;

    	// Adjustment may not be necessary
    	if ( box === ( isBorderBox ? "border" : "content" ) ) {
    		return 0;
    	}

    	for ( ; i < 4; i += 2 ) {

    		// Both box models exclude margin
    		if ( box === "margin" ) {
    			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
    		}

    		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
    		if ( !isBorderBox ) {

    			// Add padding
    			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

    			// For "border" or "margin", add border
    			if ( box !== "padding" ) {
    				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

    			// But still keep track of it otherwise
    			} else {
    				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
    			}

    		// If we get here with a border-box (content + padding + border), we're seeking "content" or
    		// "padding" or "margin"
    		} else {

    			// For "content", subtract padding
    			if ( box === "content" ) {
    				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
    			}

    			// For "content" or "padding", subtract border
    			if ( box !== "margin" ) {
    				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
    			}
    		}
    	}

    	// Account for positive content-box scroll gutter when requested by providing computedVal
    	if ( !isBorderBox && computedVal >= 0 ) {

    		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
    		// Assuming integer scroll gutter, subtract the rest and round down
    		delta += Math.max( 0, Math.ceil(
    			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
    			computedVal -
    			delta -
    			extra -
    			0.5

    		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
    		// Use an explicit zero to avoid NaN (gh-3964)
    		) ) || 0;
    	}

    	return delta;
    }

    function getWidthOrHeight( elem, dimension, extra ) {

    	// Start with computed style
    	var styles = getStyles( elem ),

    		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
    		// Fake content-box until we know it's needed to know the true value.
    		boxSizingNeeded = !support.boxSizingReliable() || extra,
    		isBorderBox = boxSizingNeeded &&
    			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
    		valueIsBorderBox = isBorderBox,

    		val = curCSS( elem, dimension, styles ),
    		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

    	// Support: Firefox <=54
    	// Return a confounding non-pixel value or feign ignorance, as appropriate.
    	if ( rnumnonpx.test( val ) ) {
    		if ( !extra ) {
    			return val;
    		}
    		val = "auto";
    	}


    	// Support: IE 9 - 11 only
    	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
    	// In those cases, the computed value can be trusted to be border-box.
    	if ( ( !support.boxSizingReliable() && isBorderBox ||

    		// Support: IE 10 - 11+, Edge 15 - 18+
    		// IE/Edge misreport `getComputedStyle` of table rows with width/height
    		// set in CSS while `offset*` properties report correct values.
    		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
    		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

    		// Fall back to offsetWidth/offsetHeight when value is "auto"
    		// This happens for inline elements with no explicit setting (gh-3571)
    		val === "auto" ||

    		// Support: Android <=4.1 - 4.3 only
    		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
    		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

    		// Make sure the element is visible & connected
    		elem.getClientRects().length ) {

    		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

    		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
    		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
    		// retrieved value as a content box dimension.
    		valueIsBorderBox = offsetProp in elem;
    		if ( valueIsBorderBox ) {
    			val = elem[ offsetProp ];
    		}
    	}

    	// Normalize "" and auto
    	val = parseFloat( val ) || 0;

    	// Adjust for the element's box model
    	return ( val +
    		boxModelAdjustment(
    			elem,
    			dimension,
    			extra || ( isBorderBox ? "border" : "content" ),
    			valueIsBorderBox,
    			styles,

    			// Provide the current computed size to request scroll gutter calculation (gh-3589)
    			val
    		)
    	) + "px";
    }

    jQuery.extend( {

    	// Add in style property hooks for overriding the default
    	// behavior of getting and setting a style property
    	cssHooks: {
    		opacity: {
    			get: function( elem, computed ) {
    				if ( computed ) {

    					// We should always get a number back from opacity
    					var ret = curCSS( elem, "opacity" );
    					return ret === "" ? "1" : ret;
    				}
    			}
    		}
    	},

    	// Don't automatically add "px" to these possibly-unitless properties
    	cssNumber: {
    		"animationIterationCount": true,
    		"columnCount": true,
    		"fillOpacity": true,
    		"flexGrow": true,
    		"flexShrink": true,
    		"fontWeight": true,
    		"gridArea": true,
    		"gridColumn": true,
    		"gridColumnEnd": true,
    		"gridColumnStart": true,
    		"gridRow": true,
    		"gridRowEnd": true,
    		"gridRowStart": true,
    		"lineHeight": true,
    		"opacity": true,
    		"order": true,
    		"orphans": true,
    		"widows": true,
    		"zIndex": true,
    		"zoom": true
    	},

    	// Add in properties whose names you wish to fix before
    	// setting or getting the value
    	cssProps: {},

    	// Get and set the style property on a DOM Node
    	style: function( elem, name, value, extra ) {

    		// Don't set styles on text and comment nodes
    		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
    			return;
    		}

    		// Make sure that we're working with the right name
    		var ret, type, hooks,
    			origName = camelCase( name ),
    			isCustomProp = rcustomProp.test( name ),
    			style = elem.style;

    		// Make sure that we're working with the right name. We don't
    		// want to query the value if it is a CSS custom property
    		// since they are user-defined.
    		if ( !isCustomProp ) {
    			name = finalPropName( origName );
    		}

    		// Gets hook for the prefixed version, then unprefixed version
    		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    		// Check if we're setting a value
    		if ( value !== undefined ) {
    			type = typeof value;

    			// Convert "+=" or "-=" to relative numbers (#7345)
    			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
    				value = adjustCSS( elem, name, ret );

    				// Fixes bug #9237
    				type = "number";
    			}

    			// Make sure that null and NaN values aren't set (#7116)
    			if ( value == null || value !== value ) {
    				return;
    			}

    			// If a number was passed in, add the unit (except for certain CSS properties)
    			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
    			// "px" to a few hardcoded values.
    			if ( type === "number" && !isCustomProp ) {
    				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
    			}

    			// background-* props affect original clone's values
    			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
    				style[ name ] = "inherit";
    			}

    			// If a hook was provided, use that value, otherwise just set the specified value
    			if ( !hooks || !( "set" in hooks ) ||
    				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

    				if ( isCustomProp ) {
    					style.setProperty( name, value );
    				} else {
    					style[ name ] = value;
    				}
    			}

    		} else {

    			// If a hook was provided get the non-computed value from there
    			if ( hooks && "get" in hooks &&
    				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

    				return ret;
    			}

    			// Otherwise just get the value from the style object
    			return style[ name ];
    		}
    	},

    	css: function( elem, name, extra, styles ) {
    		var val, num, hooks,
    			origName = camelCase( name ),
    			isCustomProp = rcustomProp.test( name );

    		// Make sure that we're working with the right name. We don't
    		// want to modify the value if it is a CSS custom property
    		// since they are user-defined.
    		if ( !isCustomProp ) {
    			name = finalPropName( origName );
    		}

    		// Try prefixed name followed by the unprefixed name
    		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    		// If a hook was provided get the computed value from there
    		if ( hooks && "get" in hooks ) {
    			val = hooks.get( elem, true, extra );
    		}

    		// Otherwise, if a way to get the computed value exists, use that
    		if ( val === undefined ) {
    			val = curCSS( elem, name, styles );
    		}

    		// Convert "normal" to computed value
    		if ( val === "normal" && name in cssNormalTransform ) {
    			val = cssNormalTransform[ name ];
    		}

    		// Make numeric if forced or a qualifier was provided and val looks numeric
    		if ( extra === "" || extra ) {
    			num = parseFloat( val );
    			return extra === true || isFinite( num ) ? num || 0 : val;
    		}

    		return val;
    	}
    } );

    jQuery.each( [ "height", "width" ], function( _i, dimension ) {
    	jQuery.cssHooks[ dimension ] = {
    		get: function( elem, computed, extra ) {
    			if ( computed ) {

    				// Certain elements can have dimension info if we invisibly show them
    				// but it must have a current display style that would benefit
    				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

    					// Support: Safari 8+
    					// Table columns in Safari have non-zero offsetWidth & zero
    					// getBoundingClientRect().width unless display is changed.
    					// Support: IE <=11 only
    					// Running getBoundingClientRect on a disconnected node
    					// in IE throws an error.
    					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
    						swap( elem, cssShow, function() {
    							return getWidthOrHeight( elem, dimension, extra );
    						} ) :
    						getWidthOrHeight( elem, dimension, extra );
    			}
    		},

    		set: function( elem, value, extra ) {
    			var matches,
    				styles = getStyles( elem ),

    				// Only read styles.position if the test has a chance to fail
    				// to avoid forcing a reflow.
    				scrollboxSizeBuggy = !support.scrollboxSize() &&
    					styles.position === "absolute",

    				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
    				boxSizingNeeded = scrollboxSizeBuggy || extra,
    				isBorderBox = boxSizingNeeded &&
    					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
    				subtract = extra ?
    					boxModelAdjustment(
    						elem,
    						dimension,
    						extra,
    						isBorderBox,
    						styles
    					) :
    					0;

    			// Account for unreliable border-box dimensions by comparing offset* to computed and
    			// faking a content-box to get border and padding (gh-3699)
    			if ( isBorderBox && scrollboxSizeBuggy ) {
    				subtract -= Math.ceil(
    					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
    					parseFloat( styles[ dimension ] ) -
    					boxModelAdjustment( elem, dimension, "border", false, styles ) -
    					0.5
    				);
    			}

    			// Convert to pixels if value adjustment is needed
    			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
    				( matches[ 3 ] || "px" ) !== "px" ) {

    				elem.style[ dimension ] = value;
    				value = jQuery.css( elem, dimension );
    			}

    			return setPositiveNumber( elem, value, subtract );
    		}
    	};
    } );

    jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
    	function( elem, computed ) {
    		if ( computed ) {
    			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
    				elem.getBoundingClientRect().left -
    					swap( elem, { marginLeft: 0 }, function() {
    						return elem.getBoundingClientRect().left;
    					} )
    				) + "px";
    		}
    	}
    );

    // These hooks are used by animate to expand properties
    jQuery.each( {
    	margin: "",
    	padding: "",
    	border: "Width"
    }, function( prefix, suffix ) {
    	jQuery.cssHooks[ prefix + suffix ] = {
    		expand: function( value ) {
    			var i = 0,
    				expanded = {},

    				// Assumes a single number if not a string
    				parts = typeof value === "string" ? value.split( " " ) : [ value ];

    			for ( ; i < 4; i++ ) {
    				expanded[ prefix + cssExpand[ i ] + suffix ] =
    					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
    			}

    			return expanded;
    		}
    	};

    	if ( prefix !== "margin" ) {
    		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
    	}
    } );

    jQuery.fn.extend( {
    	css: function( name, value ) {
    		return access( this, function( elem, name, value ) {
    			var styles, len,
    				map = {},
    				i = 0;

    			if ( Array.isArray( name ) ) {
    				styles = getStyles( elem );
    				len = name.length;

    				for ( ; i < len; i++ ) {
    					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
    				}

    				return map;
    			}

    			return value !== undefined ?
    				jQuery.style( elem, name, value ) :
    				jQuery.css( elem, name );
    		}, name, value, arguments.length > 1 );
    	}
    } );


    function Tween( elem, options, prop, end, easing ) {
    	return new Tween.prototype.init( elem, options, prop, end, easing );
    }
    jQuery.Tween = Tween;

    Tween.prototype = {
    	constructor: Tween,
    	init: function( elem, options, prop, end, easing, unit ) {
    		this.elem = elem;
    		this.prop = prop;
    		this.easing = easing || jQuery.easing._default;
    		this.options = options;
    		this.start = this.now = this.cur();
    		this.end = end;
    		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
    	},
    	cur: function() {
    		var hooks = Tween.propHooks[ this.prop ];

    		return hooks && hooks.get ?
    			hooks.get( this ) :
    			Tween.propHooks._default.get( this );
    	},
    	run: function( percent ) {
    		var eased,
    			hooks = Tween.propHooks[ this.prop ];

    		if ( this.options.duration ) {
    			this.pos = eased = jQuery.easing[ this.easing ](
    				percent, this.options.duration * percent, 0, 1, this.options.duration
    			);
    		} else {
    			this.pos = eased = percent;
    		}
    		this.now = ( this.end - this.start ) * eased + this.start;

    		if ( this.options.step ) {
    			this.options.step.call( this.elem, this.now, this );
    		}

    		if ( hooks && hooks.set ) {
    			hooks.set( this );
    		} else {
    			Tween.propHooks._default.set( this );
    		}
    		return this;
    	}
    };

    Tween.prototype.init.prototype = Tween.prototype;

    Tween.propHooks = {
    	_default: {
    		get: function( tween ) {
    			var result;

    			// Use a property on the element directly when it is not a DOM element,
    			// or when there is no matching style property that exists.
    			if ( tween.elem.nodeType !== 1 ||
    				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
    				return tween.elem[ tween.prop ];
    			}

    			// Passing an empty string as a 3rd parameter to .css will automatically
    			// attempt a parseFloat and fallback to a string if the parse fails.
    			// Simple values such as "10px" are parsed to Float;
    			// complex values such as "rotate(1rad)" are returned as-is.
    			result = jQuery.css( tween.elem, tween.prop, "" );

    			// Empty strings, null, undefined and "auto" are converted to 0.
    			return !result || result === "auto" ? 0 : result;
    		},
    		set: function( tween ) {

    			// Use step hook for back compat.
    			// Use cssHook if its there.
    			// Use .style if available and use plain properties where available.
    			if ( jQuery.fx.step[ tween.prop ] ) {
    				jQuery.fx.step[ tween.prop ]( tween );
    			} else if ( tween.elem.nodeType === 1 && (
    					jQuery.cssHooks[ tween.prop ] ||
    					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
    				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
    			} else {
    				tween.elem[ tween.prop ] = tween.now;
    			}
    		}
    	}
    };

    // Support: IE <=9 only
    // Panic based approach to setting things on disconnected nodes
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    	set: function( tween ) {
    		if ( tween.elem.nodeType && tween.elem.parentNode ) {
    			tween.elem[ tween.prop ] = tween.now;
    		}
    	}
    };

    jQuery.easing = {
    	linear: function( p ) {
    		return p;
    	},
    	swing: function( p ) {
    		return 0.5 - Math.cos( p * Math.PI ) / 2;
    	},
    	_default: "swing"
    };

    jQuery.fx = Tween.prototype.init;

    // Back compat <1.8 extension point
    jQuery.fx.step = {};




    var
    	fxNow, inProgress,
    	rfxtypes = /^(?:toggle|show|hide)$/,
    	rrun = /queueHooks$/;

    function schedule() {
    	if ( inProgress ) {
    		if ( document.hidden === false && window.requestAnimationFrame ) {
    			window.requestAnimationFrame( schedule );
    		} else {
    			window.setTimeout( schedule, jQuery.fx.interval );
    		}

    		jQuery.fx.tick();
    	}
    }

    // Animations created synchronously will run synchronously
    function createFxNow() {
    	window.setTimeout( function() {
    		fxNow = undefined;
    	} );
    	return ( fxNow = Date.now() );
    }

    // Generate parameters to create a standard animation
    function genFx( type, includeWidth ) {
    	var which,
    		i = 0,
    		attrs = { height: type };

    	// If we include width, step value is 1 to do all cssExpand values,
    	// otherwise step value is 2 to skip over Left and Right
    	includeWidth = includeWidth ? 1 : 0;
    	for ( ; i < 4; i += 2 - includeWidth ) {
    		which = cssExpand[ i ];
    		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
    	}

    	if ( includeWidth ) {
    		attrs.opacity = attrs.width = type;
    	}

    	return attrs;
    }

    function createTween( value, prop, animation ) {
    	var tween,
    		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
    		index = 0,
    		length = collection.length;
    	for ( ; index < length; index++ ) {
    		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

    			// We're done with this property
    			return tween;
    		}
    	}
    }

    function defaultPrefilter( elem, props, opts ) {
    	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
    		isBox = "width" in props || "height" in props,
    		anim = this,
    		orig = {},
    		style = elem.style,
    		hidden = elem.nodeType && isHiddenWithinTree( elem ),
    		dataShow = dataPriv.get( elem, "fxshow" );

    	// Queue-skipping animations hijack the fx hooks
    	if ( !opts.queue ) {
    		hooks = jQuery._queueHooks( elem, "fx" );
    		if ( hooks.unqueued == null ) {
    			hooks.unqueued = 0;
    			oldfire = hooks.empty.fire;
    			hooks.empty.fire = function() {
    				if ( !hooks.unqueued ) {
    					oldfire();
    				}
    			};
    		}
    		hooks.unqueued++;

    		anim.always( function() {

    			// Ensure the complete handler is called before this completes
    			anim.always( function() {
    				hooks.unqueued--;
    				if ( !jQuery.queue( elem, "fx" ).length ) {
    					hooks.empty.fire();
    				}
    			} );
    		} );
    	}

    	// Detect show/hide animations
    	for ( prop in props ) {
    		value = props[ prop ];
    		if ( rfxtypes.test( value ) ) {
    			delete props[ prop ];
    			toggle = toggle || value === "toggle";
    			if ( value === ( hidden ? "hide" : "show" ) ) {

    				// Pretend to be hidden if this is a "show" and
    				// there is still data from a stopped show/hide
    				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
    					hidden = true;

    				// Ignore all other no-op show/hide data
    				} else {
    					continue;
    				}
    			}
    			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
    		}
    	}

    	// Bail out if this is a no-op like .hide().hide()
    	propTween = !jQuery.isEmptyObject( props );
    	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
    		return;
    	}

    	// Restrict "overflow" and "display" styles during box animations
    	if ( isBox && elem.nodeType === 1 ) {

    		// Support: IE <=9 - 11, Edge 12 - 15
    		// Record all 3 overflow attributes because IE does not infer the shorthand
    		// from identically-valued overflowX and overflowY and Edge just mirrors
    		// the overflowX value there.
    		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    		// Identify a display type, preferring old show/hide data over the CSS cascade
    		restoreDisplay = dataShow && dataShow.display;
    		if ( restoreDisplay == null ) {
    			restoreDisplay = dataPriv.get( elem, "display" );
    		}
    		display = jQuery.css( elem, "display" );
    		if ( display === "none" ) {
    			if ( restoreDisplay ) {
    				display = restoreDisplay;
    			} else {

    				// Get nonempty value(s) by temporarily forcing visibility
    				showHide( [ elem ], true );
    				restoreDisplay = elem.style.display || restoreDisplay;
    				display = jQuery.css( elem, "display" );
    				showHide( [ elem ] );
    			}
    		}

    		// Animate inline elements as inline-block
    		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
    			if ( jQuery.css( elem, "float" ) === "none" ) {

    				// Restore the original display value at the end of pure show/hide animations
    				if ( !propTween ) {
    					anim.done( function() {
    						style.display = restoreDisplay;
    					} );
    					if ( restoreDisplay == null ) {
    						display = style.display;
    						restoreDisplay = display === "none" ? "" : display;
    					}
    				}
    				style.display = "inline-block";
    			}
    		}
    	}

    	if ( opts.overflow ) {
    		style.overflow = "hidden";
    		anim.always( function() {
    			style.overflow = opts.overflow[ 0 ];
    			style.overflowX = opts.overflow[ 1 ];
    			style.overflowY = opts.overflow[ 2 ];
    		} );
    	}

    	// Implement show/hide animations
    	propTween = false;
    	for ( prop in orig ) {

    		// General show/hide setup for this element animation
    		if ( !propTween ) {
    			if ( dataShow ) {
    				if ( "hidden" in dataShow ) {
    					hidden = dataShow.hidden;
    				}
    			} else {
    				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
    			}

    			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
    			if ( toggle ) {
    				dataShow.hidden = !hidden;
    			}

    			// Show elements before animating them
    			if ( hidden ) {
    				showHide( [ elem ], true );
    			}

    			/* eslint-disable no-loop-func */

    			anim.done( function() {

    			/* eslint-enable no-loop-func */

    				// The final step of a "hide" animation is actually hiding the element
    				if ( !hidden ) {
    					showHide( [ elem ] );
    				}
    				dataPriv.remove( elem, "fxshow" );
    				for ( prop in orig ) {
    					jQuery.style( elem, prop, orig[ prop ] );
    				}
    			} );
    		}

    		// Per-property setup
    		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
    		if ( !( prop in dataShow ) ) {
    			dataShow[ prop ] = propTween.start;
    			if ( hidden ) {
    				propTween.end = propTween.start;
    				propTween.start = 0;
    			}
    		}
    	}
    }

    function propFilter( props, specialEasing ) {
    	var index, name, easing, value, hooks;

    	// camelCase, specialEasing and expand cssHook pass
    	for ( index in props ) {
    		name = camelCase( index );
    		easing = specialEasing[ name ];
    		value = props[ index ];
    		if ( Array.isArray( value ) ) {
    			easing = value[ 1 ];
    			value = props[ index ] = value[ 0 ];
    		}

    		if ( index !== name ) {
    			props[ name ] = value;
    			delete props[ index ];
    		}

    		hooks = jQuery.cssHooks[ name ];
    		if ( hooks && "expand" in hooks ) {
    			value = hooks.expand( value );
    			delete props[ name ];

    			// Not quite $.extend, this won't overwrite existing keys.
    			// Reusing 'index' because we have the correct "name"
    			for ( index in value ) {
    				if ( !( index in props ) ) {
    					props[ index ] = value[ index ];
    					specialEasing[ index ] = easing;
    				}
    			}
    		} else {
    			specialEasing[ name ] = easing;
    		}
    	}
    }

    function Animation( elem, properties, options ) {
    	var result,
    		stopped,
    		index = 0,
    		length = Animation.prefilters.length,
    		deferred = jQuery.Deferred().always( function() {

    			// Don't match elem in the :animated selector
    			delete tick.elem;
    		} ),
    		tick = function() {
    			if ( stopped ) {
    				return false;
    			}
    			var currentTime = fxNow || createFxNow(),
    				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

    				// Support: Android 2.3 only
    				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
    				temp = remaining / animation.duration || 0,
    				percent = 1 - temp,
    				index = 0,
    				length = animation.tweens.length;

    			for ( ; index < length; index++ ) {
    				animation.tweens[ index ].run( percent );
    			}

    			deferred.notifyWith( elem, [ animation, percent, remaining ] );

    			// If there's more to do, yield
    			if ( percent < 1 && length ) {
    				return remaining;
    			}

    			// If this was an empty animation, synthesize a final progress notification
    			if ( !length ) {
    				deferred.notifyWith( elem, [ animation, 1, 0 ] );
    			}

    			// Resolve the animation and report its conclusion
    			deferred.resolveWith( elem, [ animation ] );
    			return false;
    		},
    		animation = deferred.promise( {
    			elem: elem,
    			props: jQuery.extend( {}, properties ),
    			opts: jQuery.extend( true, {
    				specialEasing: {},
    				easing: jQuery.easing._default
    			}, options ),
    			originalProperties: properties,
    			originalOptions: options,
    			startTime: fxNow || createFxNow(),
    			duration: options.duration,
    			tweens: [],
    			createTween: function( prop, end ) {
    				var tween = jQuery.Tween( elem, animation.opts, prop, end,
    						animation.opts.specialEasing[ prop ] || animation.opts.easing );
    				animation.tweens.push( tween );
    				return tween;
    			},
    			stop: function( gotoEnd ) {
    				var index = 0,

    					// If we are going to the end, we want to run all the tweens
    					// otherwise we skip this part
    					length = gotoEnd ? animation.tweens.length : 0;
    				if ( stopped ) {
    					return this;
    				}
    				stopped = true;
    				for ( ; index < length; index++ ) {
    					animation.tweens[ index ].run( 1 );
    				}

    				// Resolve when we played the last frame; otherwise, reject
    				if ( gotoEnd ) {
    					deferred.notifyWith( elem, [ animation, 1, 0 ] );
    					deferred.resolveWith( elem, [ animation, gotoEnd ] );
    				} else {
    					deferred.rejectWith( elem, [ animation, gotoEnd ] );
    				}
    				return this;
    			}
    		} ),
    		props = animation.props;

    	propFilter( props, animation.opts.specialEasing );

    	for ( ; index < length; index++ ) {
    		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
    		if ( result ) {
    			if ( isFunction( result.stop ) ) {
    				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
    					result.stop.bind( result );
    			}
    			return result;
    		}
    	}

    	jQuery.map( props, createTween, animation );

    	if ( isFunction( animation.opts.start ) ) {
    		animation.opts.start.call( elem, animation );
    	}

    	// Attach callbacks from options
    	animation
    		.progress( animation.opts.progress )
    		.done( animation.opts.done, animation.opts.complete )
    		.fail( animation.opts.fail )
    		.always( animation.opts.always );

    	jQuery.fx.timer(
    		jQuery.extend( tick, {
    			elem: elem,
    			anim: animation,
    			queue: animation.opts.queue
    		} )
    	);

    	return animation;
    }

    jQuery.Animation = jQuery.extend( Animation, {

    	tweeners: {
    		"*": [ function( prop, value ) {
    			var tween = this.createTween( prop, value );
    			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
    			return tween;
    		} ]
    	},

    	tweener: function( props, callback ) {
    		if ( isFunction( props ) ) {
    			callback = props;
    			props = [ "*" ];
    		} else {
    			props = props.match( rnothtmlwhite );
    		}

    		var prop,
    			index = 0,
    			length = props.length;

    		for ( ; index < length; index++ ) {
    			prop = props[ index ];
    			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
    			Animation.tweeners[ prop ].unshift( callback );
    		}
    	},

    	prefilters: [ defaultPrefilter ],

    	prefilter: function( callback, prepend ) {
    		if ( prepend ) {
    			Animation.prefilters.unshift( callback );
    		} else {
    			Animation.prefilters.push( callback );
    		}
    	}
    } );

    jQuery.speed = function( speed, easing, fn ) {
    	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    		complete: fn || !fn && easing ||
    			isFunction( speed ) && speed,
    		duration: speed,
    		easing: fn && easing || easing && !isFunction( easing ) && easing
    	};

    	// Go to the end state if fx are off
    	if ( jQuery.fx.off ) {
    		opt.duration = 0;

    	} else {
    		if ( typeof opt.duration !== "number" ) {
    			if ( opt.duration in jQuery.fx.speeds ) {
    				opt.duration = jQuery.fx.speeds[ opt.duration ];

    			} else {
    				opt.duration = jQuery.fx.speeds._default;
    			}
    		}
    	}

    	// Normalize opt.queue - true/undefined/null -> "fx"
    	if ( opt.queue == null || opt.queue === true ) {
    		opt.queue = "fx";
    	}

    	// Queueing
    	opt.old = opt.complete;

    	opt.complete = function() {
    		if ( isFunction( opt.old ) ) {
    			opt.old.call( this );
    		}

    		if ( opt.queue ) {
    			jQuery.dequeue( this, opt.queue );
    		}
    	};

    	return opt;
    };

    jQuery.fn.extend( {
    	fadeTo: function( speed, to, easing, callback ) {

    		// Show any hidden elements after setting opacity to 0
    		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

    			// Animate to the value specified
    			.end().animate( { opacity: to }, speed, easing, callback );
    	},
    	animate: function( prop, speed, easing, callback ) {
    		var empty = jQuery.isEmptyObject( prop ),
    			optall = jQuery.speed( speed, easing, callback ),
    			doAnimation = function() {

    				// Operate on a copy of prop so per-property easing won't be lost
    				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

    				// Empty animations, or finishing resolves immediately
    				if ( empty || dataPriv.get( this, "finish" ) ) {
    					anim.stop( true );
    				}
    			};
    			doAnimation.finish = doAnimation;

    		return empty || optall.queue === false ?
    			this.each( doAnimation ) :
    			this.queue( optall.queue, doAnimation );
    	},
    	stop: function( type, clearQueue, gotoEnd ) {
    		var stopQueue = function( hooks ) {
    			var stop = hooks.stop;
    			delete hooks.stop;
    			stop( gotoEnd );
    		};

    		if ( typeof type !== "string" ) {
    			gotoEnd = clearQueue;
    			clearQueue = type;
    			type = undefined;
    		}
    		if ( clearQueue ) {
    			this.queue( type || "fx", [] );
    		}

    		return this.each( function() {
    			var dequeue = true,
    				index = type != null && type + "queueHooks",
    				timers = jQuery.timers,
    				data = dataPriv.get( this );

    			if ( index ) {
    				if ( data[ index ] && data[ index ].stop ) {
    					stopQueue( data[ index ] );
    				}
    			} else {
    				for ( index in data ) {
    					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
    						stopQueue( data[ index ] );
    					}
    				}
    			}

    			for ( index = timers.length; index--; ) {
    				if ( timers[ index ].elem === this &&
    					( type == null || timers[ index ].queue === type ) ) {

    					timers[ index ].anim.stop( gotoEnd );
    					dequeue = false;
    					timers.splice( index, 1 );
    				}
    			}

    			// Start the next in the queue if the last step wasn't forced.
    			// Timers currently will call their complete callbacks, which
    			// will dequeue but only if they were gotoEnd.
    			if ( dequeue || !gotoEnd ) {
    				jQuery.dequeue( this, type );
    			}
    		} );
    	},
    	finish: function( type ) {
    		if ( type !== false ) {
    			type = type || "fx";
    		}
    		return this.each( function() {
    			var index,
    				data = dataPriv.get( this ),
    				queue = data[ type + "queue" ],
    				hooks = data[ type + "queueHooks" ],
    				timers = jQuery.timers,
    				length = queue ? queue.length : 0;

    			// Enable finishing flag on private data
    			data.finish = true;

    			// Empty the queue first
    			jQuery.queue( this, type, [] );

    			if ( hooks && hooks.stop ) {
    				hooks.stop.call( this, true );
    			}

    			// Look for any active animations, and finish them
    			for ( index = timers.length; index--; ) {
    				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
    					timers[ index ].anim.stop( true );
    					timers.splice( index, 1 );
    				}
    			}

    			// Look for any animations in the old queue and finish them
    			for ( index = 0; index < length; index++ ) {
    				if ( queue[ index ] && queue[ index ].finish ) {
    					queue[ index ].finish.call( this );
    				}
    			}

    			// Turn off finishing flag
    			delete data.finish;
    		} );
    	}
    } );

    jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
    	var cssFn = jQuery.fn[ name ];
    	jQuery.fn[ name ] = function( speed, easing, callback ) {
    		return speed == null || typeof speed === "boolean" ?
    			cssFn.apply( this, arguments ) :
    			this.animate( genFx( name, true ), speed, easing, callback );
    	};
    } );

    // Generate shortcuts for custom animations
    jQuery.each( {
    	slideDown: genFx( "show" ),
    	slideUp: genFx( "hide" ),
    	slideToggle: genFx( "toggle" ),
    	fadeIn: { opacity: "show" },
    	fadeOut: { opacity: "hide" },
    	fadeToggle: { opacity: "toggle" }
    }, function( name, props ) {
    	jQuery.fn[ name ] = function( speed, easing, callback ) {
    		return this.animate( props, speed, easing, callback );
    	};
    } );

    jQuery.timers = [];
    jQuery.fx.tick = function() {
    	var timer,
    		i = 0,
    		timers = jQuery.timers;

    	fxNow = Date.now();

    	for ( ; i < timers.length; i++ ) {
    		timer = timers[ i ];

    		// Run the timer and safely remove it when done (allowing for external removal)
    		if ( !timer() && timers[ i ] === timer ) {
    			timers.splice( i--, 1 );
    		}
    	}

    	if ( !timers.length ) {
    		jQuery.fx.stop();
    	}
    	fxNow = undefined;
    };

    jQuery.fx.timer = function( timer ) {
    	jQuery.timers.push( timer );
    	jQuery.fx.start();
    };

    jQuery.fx.interval = 13;
    jQuery.fx.start = function() {
    	if ( inProgress ) {
    		return;
    	}

    	inProgress = true;
    	schedule();
    };

    jQuery.fx.stop = function() {
    	inProgress = null;
    };

    jQuery.fx.speeds = {
    	slow: 600,
    	fast: 200,

    	// Default speed
    	_default: 400
    };


    // Based off of the plugin by Clint Helfers, with permission.
    // https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
    jQuery.fn.delay = function( time, type ) {
    	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
    	type = type || "fx";

    	return this.queue( type, function( next, hooks ) {
    		var timeout = window.setTimeout( next, time );
    		hooks.stop = function() {
    			window.clearTimeout( timeout );
    		};
    	} );
    };


    ( function() {
    	var input = document.createElement( "input" ),
    		select = document.createElement( "select" ),
    		opt = select.appendChild( document.createElement( "option" ) );

    	input.type = "checkbox";

    	// Support: Android <=4.3 only
    	// Default value for a checkbox should be "on"
    	support.checkOn = input.value !== "";

    	// Support: IE <=11 only
    	// Must access selectedIndex to make default options select
    	support.optSelected = opt.selected;

    	// Support: IE <=11 only
    	// An input loses its value after becoming a radio
    	input = document.createElement( "input" );
    	input.value = "t";
    	input.type = "radio";
    	support.radioValue = input.value === "t";
    } )();


    var boolHook,
    	attrHandle = jQuery.expr.attrHandle;

    jQuery.fn.extend( {
    	attr: function( name, value ) {
    		return access( this, jQuery.attr, name, value, arguments.length > 1 );
    	},

    	removeAttr: function( name ) {
    		return this.each( function() {
    			jQuery.removeAttr( this, name );
    		} );
    	}
    } );

    jQuery.extend( {
    	attr: function( elem, name, value ) {
    		var ret, hooks,
    			nType = elem.nodeType;

    		// Don't get/set attributes on text, comment and attribute nodes
    		if ( nType === 3 || nType === 8 || nType === 2 ) {
    			return;
    		}

    		// Fallback to prop when attributes are not supported
    		if ( typeof elem.getAttribute === "undefined" ) {
    			return jQuery.prop( elem, name, value );
    		}

    		// Attribute hooks are determined by the lowercase version
    		// Grab necessary hook if one is defined
    		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
    			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
    				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
    		}

    		if ( value !== undefined ) {
    			if ( value === null ) {
    				jQuery.removeAttr( elem, name );
    				return;
    			}

    			if ( hooks && "set" in hooks &&
    				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
    				return ret;
    			}

    			elem.setAttribute( name, value + "" );
    			return value;
    		}

    		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
    			return ret;
    		}

    		ret = jQuery.find.attr( elem, name );

    		// Non-existent attributes return null, we normalize to undefined
    		return ret == null ? undefined : ret;
    	},

    	attrHooks: {
    		type: {
    			set: function( elem, value ) {
    				if ( !support.radioValue && value === "radio" &&
    					nodeName( elem, "input" ) ) {
    					var val = elem.value;
    					elem.setAttribute( "type", value );
    					if ( val ) {
    						elem.value = val;
    					}
    					return value;
    				}
    			}
    		}
    	},

    	removeAttr: function( elem, value ) {
    		var name,
    			i = 0,

    			// Attribute names can contain non-HTML whitespace characters
    			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    			attrNames = value && value.match( rnothtmlwhite );

    		if ( attrNames && elem.nodeType === 1 ) {
    			while ( ( name = attrNames[ i++ ] ) ) {
    				elem.removeAttribute( name );
    			}
    		}
    	}
    } );

    // Hooks for boolean attributes
    boolHook = {
    	set: function( elem, value, name ) {
    		if ( value === false ) {

    			// Remove boolean attributes when set to false
    			jQuery.removeAttr( elem, name );
    		} else {
    			elem.setAttribute( name, name );
    		}
    		return name;
    	}
    };

    jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
    	var getter = attrHandle[ name ] || jQuery.find.attr;

    	attrHandle[ name ] = function( elem, name, isXML ) {
    		var ret, handle,
    			lowercaseName = name.toLowerCase();

    		if ( !isXML ) {

    			// Avoid an infinite loop by temporarily removing this function from the getter
    			handle = attrHandle[ lowercaseName ];
    			attrHandle[ lowercaseName ] = ret;
    			ret = getter( elem, name, isXML ) != null ?
    				lowercaseName :
    				null;
    			attrHandle[ lowercaseName ] = handle;
    		}
    		return ret;
    	};
    } );




    var rfocusable = /^(?:input|select|textarea|button)$/i,
    	rclickable = /^(?:a|area)$/i;

    jQuery.fn.extend( {
    	prop: function( name, value ) {
    		return access( this, jQuery.prop, name, value, arguments.length > 1 );
    	},

    	removeProp: function( name ) {
    		return this.each( function() {
    			delete this[ jQuery.propFix[ name ] || name ];
    		} );
    	}
    } );

    jQuery.extend( {
    	prop: function( elem, name, value ) {
    		var ret, hooks,
    			nType = elem.nodeType;

    		// Don't get/set properties on text, comment and attribute nodes
    		if ( nType === 3 || nType === 8 || nType === 2 ) {
    			return;
    		}

    		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

    			// Fix name and attach hooks
    			name = jQuery.propFix[ name ] || name;
    			hooks = jQuery.propHooks[ name ];
    		}

    		if ( value !== undefined ) {
    			if ( hooks && "set" in hooks &&
    				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
    				return ret;
    			}

    			return ( elem[ name ] = value );
    		}

    		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
    			return ret;
    		}

    		return elem[ name ];
    	},

    	propHooks: {
    		tabIndex: {
    			get: function( elem ) {

    				// Support: IE <=9 - 11 only
    				// elem.tabIndex doesn't always return the
    				// correct value when it hasn't been explicitly set
    				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
    				// Use proper attribute retrieval(#12072)
    				var tabindex = jQuery.find.attr( elem, "tabindex" );

    				if ( tabindex ) {
    					return parseInt( tabindex, 10 );
    				}

    				if (
    					rfocusable.test( elem.nodeName ) ||
    					rclickable.test( elem.nodeName ) &&
    					elem.href
    				) {
    					return 0;
    				}

    				return -1;
    			}
    		}
    	},

    	propFix: {
    		"for": "htmlFor",
    		"class": "className"
    	}
    } );

    // Support: IE <=11 only
    // Accessing the selectedIndex property
    // forces the browser to respect setting selected
    // on the option
    // The getter ensures a default option is selected
    // when in an optgroup
    // eslint rule "no-unused-expressions" is disabled for this code
    // since it considers such accessions noop
    if ( !support.optSelected ) {
    	jQuery.propHooks.selected = {
    		get: function( elem ) {

    			/* eslint no-unused-expressions: "off" */

    			var parent = elem.parentNode;
    			if ( parent && parent.parentNode ) {
    				parent.parentNode.selectedIndex;
    			}
    			return null;
    		},
    		set: function( elem ) {

    			/* eslint no-unused-expressions: "off" */

    			var parent = elem.parentNode;
    			if ( parent ) {
    				parent.selectedIndex;

    				if ( parent.parentNode ) {
    					parent.parentNode.selectedIndex;
    				}
    			}
    		}
    	};
    }

    jQuery.each( [
    	"tabIndex",
    	"readOnly",
    	"maxLength",
    	"cellSpacing",
    	"cellPadding",
    	"rowSpan",
    	"colSpan",
    	"useMap",
    	"frameBorder",
    	"contentEditable"
    ], function() {
    	jQuery.propFix[ this.toLowerCase() ] = this;
    } );




    	// Strip and collapse whitespace according to HTML spec
    	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
    	function stripAndCollapse( value ) {
    		var tokens = value.match( rnothtmlwhite ) || [];
    		return tokens.join( " " );
    	}


    function getClass( elem ) {
    	return elem.getAttribute && elem.getAttribute( "class" ) || "";
    }

    function classesToArray( value ) {
    	if ( Array.isArray( value ) ) {
    		return value;
    	}
    	if ( typeof value === "string" ) {
    		return value.match( rnothtmlwhite ) || [];
    	}
    	return [];
    }

    jQuery.fn.extend( {
    	addClass: function( value ) {
    		var classes, elem, cur, curValue, clazz, j, finalValue,
    			i = 0;

    		if ( isFunction( value ) ) {
    			return this.each( function( j ) {
    				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
    			} );
    		}

    		classes = classesToArray( value );

    		if ( classes.length ) {
    			while ( ( elem = this[ i++ ] ) ) {
    				curValue = getClass( elem );
    				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

    				if ( cur ) {
    					j = 0;
    					while ( ( clazz = classes[ j++ ] ) ) {
    						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
    							cur += clazz + " ";
    						}
    					}

    					// Only assign if different to avoid unneeded rendering.
    					finalValue = stripAndCollapse( cur );
    					if ( curValue !== finalValue ) {
    						elem.setAttribute( "class", finalValue );
    					}
    				}
    			}
    		}

    		return this;
    	},

    	removeClass: function( value ) {
    		var classes, elem, cur, curValue, clazz, j, finalValue,
    			i = 0;

    		if ( isFunction( value ) ) {
    			return this.each( function( j ) {
    				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
    			} );
    		}

    		if ( !arguments.length ) {
    			return this.attr( "class", "" );
    		}

    		classes = classesToArray( value );

    		if ( classes.length ) {
    			while ( ( elem = this[ i++ ] ) ) {
    				curValue = getClass( elem );

    				// This expression is here for better compressibility (see addClass)
    				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

    				if ( cur ) {
    					j = 0;
    					while ( ( clazz = classes[ j++ ] ) ) {

    						// Remove *all* instances
    						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
    							cur = cur.replace( " " + clazz + " ", " " );
    						}
    					}

    					// Only assign if different to avoid unneeded rendering.
    					finalValue = stripAndCollapse( cur );
    					if ( curValue !== finalValue ) {
    						elem.setAttribute( "class", finalValue );
    					}
    				}
    			}
    		}

    		return this;
    	},

    	toggleClass: function( value, stateVal ) {
    		var type = typeof value,
    			isValidValue = type === "string" || Array.isArray( value );

    		if ( typeof stateVal === "boolean" && isValidValue ) {
    			return stateVal ? this.addClass( value ) : this.removeClass( value );
    		}

    		if ( isFunction( value ) ) {
    			return this.each( function( i ) {
    				jQuery( this ).toggleClass(
    					value.call( this, i, getClass( this ), stateVal ),
    					stateVal
    				);
    			} );
    		}

    		return this.each( function() {
    			var className, i, self, classNames;

    			if ( isValidValue ) {

    				// Toggle individual class names
    				i = 0;
    				self = jQuery( this );
    				classNames = classesToArray( value );

    				while ( ( className = classNames[ i++ ] ) ) {

    					// Check each className given, space separated list
    					if ( self.hasClass( className ) ) {
    						self.removeClass( className );
    					} else {
    						self.addClass( className );
    					}
    				}

    			// Toggle whole class name
    			} else if ( value === undefined || type === "boolean" ) {
    				className = getClass( this );
    				if ( className ) {

    					// Store className if set
    					dataPriv.set( this, "__className__", className );
    				}

    				// If the element has a class name or if we're passed `false`,
    				// then remove the whole classname (if there was one, the above saved it).
    				// Otherwise bring back whatever was previously saved (if anything),
    				// falling back to the empty string if nothing was stored.
    				if ( this.setAttribute ) {
    					this.setAttribute( "class",
    						className || value === false ?
    						"" :
    						dataPriv.get( this, "__className__" ) || ""
    					);
    				}
    			}
    		} );
    	},

    	hasClass: function( selector ) {
    		var className, elem,
    			i = 0;

    		className = " " + selector + " ";
    		while ( ( elem = this[ i++ ] ) ) {
    			if ( elem.nodeType === 1 &&
    				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
    					return true;
    			}
    		}

    		return false;
    	}
    } );




    var rreturn = /\r/g;

    jQuery.fn.extend( {
    	val: function( value ) {
    		var hooks, ret, valueIsFunction,
    			elem = this[ 0 ];

    		if ( !arguments.length ) {
    			if ( elem ) {
    				hooks = jQuery.valHooks[ elem.type ] ||
    					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

    				if ( hooks &&
    					"get" in hooks &&
    					( ret = hooks.get( elem, "value" ) ) !== undefined
    				) {
    					return ret;
    				}

    				ret = elem.value;

    				// Handle most common string cases
    				if ( typeof ret === "string" ) {
    					return ret.replace( rreturn, "" );
    				}

    				// Handle cases where value is null/undef or number
    				return ret == null ? "" : ret;
    			}

    			return;
    		}

    		valueIsFunction = isFunction( value );

    		return this.each( function( i ) {
    			var val;

    			if ( this.nodeType !== 1 ) {
    				return;
    			}

    			if ( valueIsFunction ) {
    				val = value.call( this, i, jQuery( this ).val() );
    			} else {
    				val = value;
    			}

    			// Treat null/undefined as ""; convert numbers to string
    			if ( val == null ) {
    				val = "";

    			} else if ( typeof val === "number" ) {
    				val += "";

    			} else if ( Array.isArray( val ) ) {
    				val = jQuery.map( val, function( value ) {
    					return value == null ? "" : value + "";
    				} );
    			}

    			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

    			// If set returns undefined, fall back to normal setting
    			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
    				this.value = val;
    			}
    		} );
    	}
    } );

    jQuery.extend( {
    	valHooks: {
    		option: {
    			get: function( elem ) {

    				var val = jQuery.find.attr( elem, "value" );
    				return val != null ?
    					val :

    					// Support: IE <=10 - 11 only
    					// option.text throws exceptions (#14686, #14858)
    					// Strip and collapse whitespace
    					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
    					stripAndCollapse( jQuery.text( elem ) );
    			}
    		},
    		select: {
    			get: function( elem ) {
    				var value, option, i,
    					options = elem.options,
    					index = elem.selectedIndex,
    					one = elem.type === "select-one",
    					values = one ? null : [],
    					max = one ? index + 1 : options.length;

    				if ( index < 0 ) {
    					i = max;

    				} else {
    					i = one ? index : 0;
    				}

    				// Loop through all the selected options
    				for ( ; i < max; i++ ) {
    					option = options[ i ];

    					// Support: IE <=9 only
    					// IE8-9 doesn't update selected after form reset (#2551)
    					if ( ( option.selected || i === index ) &&

    							// Don't return options that are disabled or in a disabled optgroup
    							!option.disabled &&
    							( !option.parentNode.disabled ||
    								!nodeName( option.parentNode, "optgroup" ) ) ) {

    						// Get the specific value for the option
    						value = jQuery( option ).val();

    						// We don't need an array for one selects
    						if ( one ) {
    							return value;
    						}

    						// Multi-Selects return an array
    						values.push( value );
    					}
    				}

    				return values;
    			},

    			set: function( elem, value ) {
    				var optionSet, option,
    					options = elem.options,
    					values = jQuery.makeArray( value ),
    					i = options.length;

    				while ( i-- ) {
    					option = options[ i ];

    					/* eslint-disable no-cond-assign */

    					if ( option.selected =
    						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
    					) {
    						optionSet = true;
    					}

    					/* eslint-enable no-cond-assign */
    				}

    				// Force browsers to behave consistently when non-matching value is set
    				if ( !optionSet ) {
    					elem.selectedIndex = -1;
    				}
    				return values;
    			}
    		}
    	}
    } );

    // Radios and checkboxes getter/setter
    jQuery.each( [ "radio", "checkbox" ], function() {
    	jQuery.valHooks[ this ] = {
    		set: function( elem, value ) {
    			if ( Array.isArray( value ) ) {
    				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
    			}
    		}
    	};
    	if ( !support.checkOn ) {
    		jQuery.valHooks[ this ].get = function( elem ) {
    			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
    		};
    	}
    } );




    // Return jQuery for attributes-only inclusion


    support.focusin = "onfocusin" in window;


    var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    	stopPropagationCallback = function( e ) {
    		e.stopPropagation();
    	};

    jQuery.extend( jQuery.event, {

    	trigger: function( event, data, elem, onlyHandlers ) {

    		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
    			eventPath = [ elem || document ],
    			type = hasOwn.call( event, "type" ) ? event.type : event,
    			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

    		cur = lastElement = tmp = elem = elem || document;

    		// Don't do events on text and comment nodes
    		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
    			return;
    		}

    		// focus/blur morphs to focusin/out; ensure we're not firing them right now
    		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
    			return;
    		}

    		if ( type.indexOf( "." ) > -1 ) {

    			// Namespaced trigger; create a regexp to match event type in handle()
    			namespaces = type.split( "." );
    			type = namespaces.shift();
    			namespaces.sort();
    		}
    		ontype = type.indexOf( ":" ) < 0 && "on" + type;

    		// Caller can pass in a jQuery.Event object, Object, or just an event type string
    		event = event[ jQuery.expando ] ?
    			event :
    			new jQuery.Event( type, typeof event === "object" && event );

    		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
    		event.isTrigger = onlyHandlers ? 2 : 3;
    		event.namespace = namespaces.join( "." );
    		event.rnamespace = event.namespace ?
    			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
    			null;

    		// Clean up the event in case it is being reused
    		event.result = undefined;
    		if ( !event.target ) {
    			event.target = elem;
    		}

    		// Clone any incoming data and prepend the event, creating the handler arg list
    		data = data == null ?
    			[ event ] :
    			jQuery.makeArray( data, [ event ] );

    		// Allow special events to draw outside the lines
    		special = jQuery.event.special[ type ] || {};
    		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
    			return;
    		}

    		// Determine event propagation path in advance, per W3C events spec (#9951)
    		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
    		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

    			bubbleType = special.delegateType || type;
    			if ( !rfocusMorph.test( bubbleType + type ) ) {
    				cur = cur.parentNode;
    			}
    			for ( ; cur; cur = cur.parentNode ) {
    				eventPath.push( cur );
    				tmp = cur;
    			}

    			// Only add window if we got to document (e.g., not plain obj or detached DOM)
    			if ( tmp === ( elem.ownerDocument || document ) ) {
    				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
    			}
    		}

    		// Fire handlers on the event path
    		i = 0;
    		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
    			lastElement = cur;
    			event.type = i > 1 ?
    				bubbleType :
    				special.bindType || type;

    			// jQuery handler
    			handle = (
    					dataPriv.get( cur, "events" ) || Object.create( null )
    				)[ event.type ] &&
    				dataPriv.get( cur, "handle" );
    			if ( handle ) {
    				handle.apply( cur, data );
    			}

    			// Native handler
    			handle = ontype && cur[ ontype ];
    			if ( handle && handle.apply && acceptData( cur ) ) {
    				event.result = handle.apply( cur, data );
    				if ( event.result === false ) {
    					event.preventDefault();
    				}
    			}
    		}
    		event.type = type;

    		// If nobody prevented the default action, do it now
    		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

    			if ( ( !special._default ||
    				special._default.apply( eventPath.pop(), data ) === false ) &&
    				acceptData( elem ) ) {

    				// Call a native DOM method on the target with the same name as the event.
    				// Don't do default actions on window, that's where global variables be (#6170)
    				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

    					// Don't re-trigger an onFOO event when we call its FOO() method
    					tmp = elem[ ontype ];

    					if ( tmp ) {
    						elem[ ontype ] = null;
    					}

    					// Prevent re-triggering of the same event, since we already bubbled it above
    					jQuery.event.triggered = type;

    					if ( event.isPropagationStopped() ) {
    						lastElement.addEventListener( type, stopPropagationCallback );
    					}

    					elem[ type ]();

    					if ( event.isPropagationStopped() ) {
    						lastElement.removeEventListener( type, stopPropagationCallback );
    					}

    					jQuery.event.triggered = undefined;

    					if ( tmp ) {
    						elem[ ontype ] = tmp;
    					}
    				}
    			}
    		}

    		return event.result;
    	},

    	// Piggyback on a donor event to simulate a different one
    	// Used only for `focus(in | out)` events
    	simulate: function( type, elem, event ) {
    		var e = jQuery.extend(
    			new jQuery.Event(),
    			event,
    			{
    				type: type,
    				isSimulated: true
    			}
    		);

    		jQuery.event.trigger( e, null, elem );
    	}

    } );

    jQuery.fn.extend( {

    	trigger: function( type, data ) {
    		return this.each( function() {
    			jQuery.event.trigger( type, data, this );
    		} );
    	},
    	triggerHandler: function( type, data ) {
    		var elem = this[ 0 ];
    		if ( elem ) {
    			return jQuery.event.trigger( type, data, elem, true );
    		}
    	}
    } );


    // Support: Firefox <=44
    // Firefox doesn't have focus(in | out) events
    // Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    //
    // Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
    // focus(in | out) events fire after focus & blur events,
    // which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
    // Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
    if ( !support.focusin ) {
    	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    		// Attach a single capturing handler on the document while someone wants focusin/focusout
    		var handler = function( event ) {
    			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
    		};

    		jQuery.event.special[ fix ] = {
    			setup: function() {

    				// Handle: regular nodes (via `this.ownerDocument`), window
    				// (via `this.document`) & document (via `this`).
    				var doc = this.ownerDocument || this.document || this,
    					attaches = dataPriv.access( doc, fix );

    				if ( !attaches ) {
    					doc.addEventListener( orig, handler, true );
    				}
    				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
    			},
    			teardown: function() {
    				var doc = this.ownerDocument || this.document || this,
    					attaches = dataPriv.access( doc, fix ) - 1;

    				if ( !attaches ) {
    					doc.removeEventListener( orig, handler, true );
    					dataPriv.remove( doc, fix );

    				} else {
    					dataPriv.access( doc, fix, attaches );
    				}
    			}
    		};
    	} );
    }
    var location = window.location;

    var nonce = { guid: Date.now() };

    var rquery = ( /\?/ );



    // Cross-browser xml parsing
    jQuery.parseXML = function( data ) {
    	var xml;
    	if ( !data || typeof data !== "string" ) {
    		return null;
    	}

    	// Support: IE 9 - 11 only
    	// IE throws on parseFromString with invalid input.
    	try {
    		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
    	} catch ( e ) {
    		xml = undefined;
    	}

    	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
    		jQuery.error( "Invalid XML: " + data );
    	}
    	return xml;
    };


    var
    	rbracket = /\[\]$/,
    	rCRLF = /\r?\n/g,
    	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    	rsubmittable = /^(?:input|select|textarea|keygen)/i;

    function buildParams( prefix, obj, traditional, add ) {
    	var name;

    	if ( Array.isArray( obj ) ) {

    		// Serialize array item.
    		jQuery.each( obj, function( i, v ) {
    			if ( traditional || rbracket.test( prefix ) ) {

    				// Treat each array item as a scalar.
    				add( prefix, v );

    			} else {

    				// Item is non-scalar (array or object), encode its numeric index.
    				buildParams(
    					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
    					v,
    					traditional,
    					add
    				);
    			}
    		} );

    	} else if ( !traditional && toType( obj ) === "object" ) {

    		// Serialize object item.
    		for ( name in obj ) {
    			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    		}

    	} else {

    		// Serialize scalar item.
    		add( prefix, obj );
    	}
    }

    // Serialize an array of form elements or a set of
    // key/values into a query string
    jQuery.param = function( a, traditional ) {
    	var prefix,
    		s = [],
    		add = function( key, valueOrFunction ) {

    			// If value is a function, invoke it and use its return value
    			var value = isFunction( valueOrFunction ) ?
    				valueOrFunction() :
    				valueOrFunction;

    			s[ s.length ] = encodeURIComponent( key ) + "=" +
    				encodeURIComponent( value == null ? "" : value );
    		};

    	if ( a == null ) {
    		return "";
    	}

    	// If an array was passed in, assume that it is an array of form elements.
    	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

    		// Serialize the form elements
    		jQuery.each( a, function() {
    			add( this.name, this.value );
    		} );

    	} else {

    		// If traditional, encode the "old" way (the way 1.3.2 or older
    		// did it), otherwise encode params recursively.
    		for ( prefix in a ) {
    			buildParams( prefix, a[ prefix ], traditional, add );
    		}
    	}

    	// Return the resulting serialization
    	return s.join( "&" );
    };

    jQuery.fn.extend( {
    	serialize: function() {
    		return jQuery.param( this.serializeArray() );
    	},
    	serializeArray: function() {
    		return this.map( function() {

    			// Can add propHook for "elements" to filter or add form elements
    			var elements = jQuery.prop( this, "elements" );
    			return elements ? jQuery.makeArray( elements ) : this;
    		} )
    		.filter( function() {
    			var type = this.type;

    			// Use .is( ":disabled" ) so that fieldset[disabled] works
    			return this.name && !jQuery( this ).is( ":disabled" ) &&
    				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
    				( this.checked || !rcheckableType.test( type ) );
    		} )
    		.map( function( _i, elem ) {
    			var val = jQuery( this ).val();

    			if ( val == null ) {
    				return null;
    			}

    			if ( Array.isArray( val ) ) {
    				return jQuery.map( val, function( val ) {
    					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    				} );
    			}

    			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    		} ).get();
    	}
    } );


    var
    	r20 = /%20/g,
    	rhash = /#.*$/,
    	rantiCache = /([?&])_=[^&]*/,
    	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

    	// #7653, #8125, #8152: local protocol detection
    	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    	rnoContent = /^(?:GET|HEAD)$/,
    	rprotocol = /^\/\//,

    	/* Prefilters
    	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
    	 * 2) These are called:
    	 *    - BEFORE asking for a transport
    	 *    - AFTER param serialization (s.data is a string if s.processData is true)
    	 * 3) key is the dataType
    	 * 4) the catchall symbol "*" can be used
    	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
    	 */
    	prefilters = {},

    	/* Transports bindings
    	 * 1) key is the dataType
    	 * 2) the catchall symbol "*" can be used
    	 * 3) selection will start with transport dataType and THEN go to "*" if needed
    	 */
    	transports = {},

    	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    	allTypes = "*/".concat( "*" ),

    	// Anchor tag for parsing the document origin
    	originAnchor = document.createElement( "a" );
    	originAnchor.href = location.href;

    // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports( structure ) {

    	// dataTypeExpression is optional and defaults to "*"
    	return function( dataTypeExpression, func ) {

    		if ( typeof dataTypeExpression !== "string" ) {
    			func = dataTypeExpression;
    			dataTypeExpression = "*";
    		}

    		var dataType,
    			i = 0,
    			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

    		if ( isFunction( func ) ) {

    			// For each dataType in the dataTypeExpression
    			while ( ( dataType = dataTypes[ i++ ] ) ) {

    				// Prepend if requested
    				if ( dataType[ 0 ] === "+" ) {
    					dataType = dataType.slice( 1 ) || "*";
    					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

    				// Otherwise append
    				} else {
    					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
    				}
    			}
    		}
    	};
    }

    // Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

    	var inspected = {},
    		seekingTransport = ( structure === transports );

    	function inspect( dataType ) {
    		var selected;
    		inspected[ dataType ] = true;
    		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
    			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
    			if ( typeof dataTypeOrTransport === "string" &&
    				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

    				options.dataTypes.unshift( dataTypeOrTransport );
    				inspect( dataTypeOrTransport );
    				return false;
    			} else if ( seekingTransport ) {
    				return !( selected = dataTypeOrTransport );
    			}
    		} );
    		return selected;
    	}

    	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
    }

    // A special extend for ajax options
    // that takes "flat" options (not to be deep extended)
    // Fixes #9887
    function ajaxExtend( target, src ) {
    	var key, deep,
    		flatOptions = jQuery.ajaxSettings.flatOptions || {};

    	for ( key in src ) {
    		if ( src[ key ] !== undefined ) {
    			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
    		}
    	}
    	if ( deep ) {
    		jQuery.extend( true, target, deep );
    	}

    	return target;
    }

    /* Handles responses to an ajax request:
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     */
    function ajaxHandleResponses( s, jqXHR, responses ) {

    	var ct, type, finalDataType, firstDataType,
    		contents = s.contents,
    		dataTypes = s.dataTypes;

    	// Remove auto dataType and get content-type in the process
    	while ( dataTypes[ 0 ] === "*" ) {
    		dataTypes.shift();
    		if ( ct === undefined ) {
    			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
    		}
    	}

    	// Check if we're dealing with a known content-type
    	if ( ct ) {
    		for ( type in contents ) {
    			if ( contents[ type ] && contents[ type ].test( ct ) ) {
    				dataTypes.unshift( type );
    				break;
    			}
    		}
    	}

    	// Check to see if we have a response for the expected dataType
    	if ( dataTypes[ 0 ] in responses ) {
    		finalDataType = dataTypes[ 0 ];
    	} else {

    		// Try convertible dataTypes
    		for ( type in responses ) {
    			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
    				finalDataType = type;
    				break;
    			}
    			if ( !firstDataType ) {
    				firstDataType = type;
    			}
    		}

    		// Or just use first one
    		finalDataType = finalDataType || firstDataType;
    	}

    	// If we found a dataType
    	// We add the dataType to the list if needed
    	// and return the corresponding response
    	if ( finalDataType ) {
    		if ( finalDataType !== dataTypes[ 0 ] ) {
    			dataTypes.unshift( finalDataType );
    		}
    		return responses[ finalDataType ];
    	}
    }

    /* Chain conversions given the request and the original response
     * Also sets the responseXXX fields on the jqXHR instance
     */
    function ajaxConvert( s, response, jqXHR, isSuccess ) {
    	var conv2, current, conv, tmp, prev,
    		converters = {},

    		// Work with a copy of dataTypes in case we need to modify it for conversion
    		dataTypes = s.dataTypes.slice();

    	// Create converters map with lowercased keys
    	if ( dataTypes[ 1 ] ) {
    		for ( conv in s.converters ) {
    			converters[ conv.toLowerCase() ] = s.converters[ conv ];
    		}
    	}

    	current = dataTypes.shift();

    	// Convert to each sequential dataType
    	while ( current ) {

    		if ( s.responseFields[ current ] ) {
    			jqXHR[ s.responseFields[ current ] ] = response;
    		}

    		// Apply the dataFilter if provided
    		if ( !prev && isSuccess && s.dataFilter ) {
    			response = s.dataFilter( response, s.dataType );
    		}

    		prev = current;
    		current = dataTypes.shift();

    		if ( current ) {

    			// There's only work to do if current dataType is non-auto
    			if ( current === "*" ) {

    				current = prev;

    			// Convert response if prev dataType is non-auto and differs from current
    			} else if ( prev !== "*" && prev !== current ) {

    				// Seek a direct converter
    				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

    				// If none found, seek a pair
    				if ( !conv ) {
    					for ( conv2 in converters ) {

    						// If conv2 outputs current
    						tmp = conv2.split( " " );
    						if ( tmp[ 1 ] === current ) {

    							// If prev can be converted to accepted input
    							conv = converters[ prev + " " + tmp[ 0 ] ] ||
    								converters[ "* " + tmp[ 0 ] ];
    							if ( conv ) {

    								// Condense equivalence converters
    								if ( conv === true ) {
    									conv = converters[ conv2 ];

    								// Otherwise, insert the intermediate dataType
    								} else if ( converters[ conv2 ] !== true ) {
    									current = tmp[ 0 ];
    									dataTypes.unshift( tmp[ 1 ] );
    								}
    								break;
    							}
    						}
    					}
    				}

    				// Apply converter (if not an equivalence)
    				if ( conv !== true ) {

    					// Unless errors are allowed to bubble, catch and return them
    					if ( conv && s.throws ) {
    						response = conv( response );
    					} else {
    						try {
    							response = conv( response );
    						} catch ( e ) {
    							return {
    								state: "parsererror",
    								error: conv ? e : "No conversion from " + prev + " to " + current
    							};
    						}
    					}
    				}
    			}
    		}
    	}

    	return { state: "success", data: response };
    }

    jQuery.extend( {

    	// Counter for holding the number of active queries
    	active: 0,

    	// Last-Modified header cache for next request
    	lastModified: {},
    	etag: {},

    	ajaxSettings: {
    		url: location.href,
    		type: "GET",
    		isLocal: rlocalProtocol.test( location.protocol ),
    		global: true,
    		processData: true,
    		async: true,
    		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

    		/*
    		timeout: 0,
    		data: null,
    		dataType: null,
    		username: null,
    		password: null,
    		cache: null,
    		throws: false,
    		traditional: false,
    		headers: {},
    		*/

    		accepts: {
    			"*": allTypes,
    			text: "text/plain",
    			html: "text/html",
    			xml: "application/xml, text/xml",
    			json: "application/json, text/javascript"
    		},

    		contents: {
    			xml: /\bxml\b/,
    			html: /\bhtml/,
    			json: /\bjson\b/
    		},

    		responseFields: {
    			xml: "responseXML",
    			text: "responseText",
    			json: "responseJSON"
    		},

    		// Data converters
    		// Keys separate source (or catchall "*") and destination types with a single space
    		converters: {

    			// Convert anything to text
    			"* text": String,

    			// Text to html (true = no transformation)
    			"text html": true,

    			// Evaluate text as a json expression
    			"text json": JSON.parse,

    			// Parse text as xml
    			"text xml": jQuery.parseXML
    		},

    		// For options that shouldn't be deep extended:
    		// you can add your own custom options here if
    		// and when you create one that shouldn't be
    		// deep extended (see ajaxExtend)
    		flatOptions: {
    			url: true,
    			context: true
    		}
    	},

    	// Creates a full fledged settings object into target
    	// with both ajaxSettings and settings fields.
    	// If target is omitted, writes into ajaxSettings.
    	ajaxSetup: function( target, settings ) {
    		return settings ?

    			// Building a settings object
    			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

    			// Extending ajaxSettings
    			ajaxExtend( jQuery.ajaxSettings, target );
    	},

    	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
    	ajaxTransport: addToPrefiltersOrTransports( transports ),

    	// Main method
    	ajax: function( url, options ) {

    		// If url is an object, simulate pre-1.5 signature
    		if ( typeof url === "object" ) {
    			options = url;
    			url = undefined;
    		}

    		// Force options to be an object
    		options = options || {};

    		var transport,

    			// URL without anti-cache param
    			cacheURL,

    			// Response headers
    			responseHeadersString,
    			responseHeaders,

    			// timeout handle
    			timeoutTimer,

    			// Url cleanup var
    			urlAnchor,

    			// Request state (becomes false upon send and true upon completion)
    			completed,

    			// To know if global events are to be dispatched
    			fireGlobals,

    			// Loop variable
    			i,

    			// uncached part of the url
    			uncached,

    			// Create the final options object
    			s = jQuery.ajaxSetup( {}, options ),

    			// Callbacks context
    			callbackContext = s.context || s,

    			// Context for global events is callbackContext if it is a DOM node or jQuery collection
    			globalEventContext = s.context &&
    				( callbackContext.nodeType || callbackContext.jquery ) ?
    					jQuery( callbackContext ) :
    					jQuery.event,

    			// Deferreds
    			deferred = jQuery.Deferred(),
    			completeDeferred = jQuery.Callbacks( "once memory" ),

    			// Status-dependent callbacks
    			statusCode = s.statusCode || {},

    			// Headers (they are sent all at once)
    			requestHeaders = {},
    			requestHeadersNames = {},

    			// Default abort message
    			strAbort = "canceled",

    			// Fake xhr
    			jqXHR = {
    				readyState: 0,

    				// Builds headers hashtable if needed
    				getResponseHeader: function( key ) {
    					var match;
    					if ( completed ) {
    						if ( !responseHeaders ) {
    							responseHeaders = {};
    							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
    								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
    									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
    										.concat( match[ 2 ] );
    							}
    						}
    						match = responseHeaders[ key.toLowerCase() + " " ];
    					}
    					return match == null ? null : match.join( ", " );
    				},

    				// Raw string
    				getAllResponseHeaders: function() {
    					return completed ? responseHeadersString : null;
    				},

    				// Caches the header
    				setRequestHeader: function( name, value ) {
    					if ( completed == null ) {
    						name = requestHeadersNames[ name.toLowerCase() ] =
    							requestHeadersNames[ name.toLowerCase() ] || name;
    						requestHeaders[ name ] = value;
    					}
    					return this;
    				},

    				// Overrides response content-type header
    				overrideMimeType: function( type ) {
    					if ( completed == null ) {
    						s.mimeType = type;
    					}
    					return this;
    				},

    				// Status-dependent callbacks
    				statusCode: function( map ) {
    					var code;
    					if ( map ) {
    						if ( completed ) {

    							// Execute the appropriate callbacks
    							jqXHR.always( map[ jqXHR.status ] );
    						} else {

    							// Lazy-add the new callbacks in a way that preserves old ones
    							for ( code in map ) {
    								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
    							}
    						}
    					}
    					return this;
    				},

    				// Cancel the request
    				abort: function( statusText ) {
    					var finalText = statusText || strAbort;
    					if ( transport ) {
    						transport.abort( finalText );
    					}
    					done( 0, finalText );
    					return this;
    				}
    			};

    		// Attach deferreds
    		deferred.promise( jqXHR );

    		// Add protocol if not provided (prefilters might expect it)
    		// Handle falsy url in the settings object (#10093: consistency with old signature)
    		// We also use the url parameter if available
    		s.url = ( ( url || s.url || location.href ) + "" )
    			.replace( rprotocol, location.protocol + "//" );

    		// Alias method option to type as per ticket #12004
    		s.type = options.method || options.type || s.method || s.type;

    		// Extract dataTypes list
    		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

    		// A cross-domain request is in order when the origin doesn't match the current origin.
    		if ( s.crossDomain == null ) {
    			urlAnchor = document.createElement( "a" );

    			// Support: IE <=8 - 11, Edge 12 - 15
    			// IE throws exception on accessing the href property if url is malformed,
    			// e.g. http://example.com:80x/
    			try {
    				urlAnchor.href = s.url;

    				// Support: IE <=8 - 11 only
    				// Anchor's host property isn't correctly set when s.url is relative
    				urlAnchor.href = urlAnchor.href;
    				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
    					urlAnchor.protocol + "//" + urlAnchor.host;
    			} catch ( e ) {

    				// If there is an error parsing the URL, assume it is crossDomain,
    				// it can be rejected by the transport if it is invalid
    				s.crossDomain = true;
    			}
    		}

    		// Convert data if not already a string
    		if ( s.data && s.processData && typeof s.data !== "string" ) {
    			s.data = jQuery.param( s.data, s.traditional );
    		}

    		// Apply prefilters
    		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    		// If request was aborted inside a prefilter, stop there
    		if ( completed ) {
    			return jqXHR;
    		}

    		// We can fire global events as of now if asked to
    		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
    		fireGlobals = jQuery.event && s.global;

    		// Watch for a new set of requests
    		if ( fireGlobals && jQuery.active++ === 0 ) {
    			jQuery.event.trigger( "ajaxStart" );
    		}

    		// Uppercase the type
    		s.type = s.type.toUpperCase();

    		// Determine if request has content
    		s.hasContent = !rnoContent.test( s.type );

    		// Save the URL in case we're toying with the If-Modified-Since
    		// and/or If-None-Match header later on
    		// Remove hash to simplify url manipulation
    		cacheURL = s.url.replace( rhash, "" );

    		// More options handling for requests with no content
    		if ( !s.hasContent ) {

    			// Remember the hash so we can put it back
    			uncached = s.url.slice( cacheURL.length );

    			// If data is available and should be processed, append data to url
    			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
    				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

    				// #9682: remove data so that it's not used in an eventual retry
    				delete s.data;
    			}

    			// Add or update anti-cache param if needed
    			if ( s.cache === false ) {
    				cacheURL = cacheURL.replace( rantiCache, "$1" );
    				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
    					uncached;
    			}

    			// Put hash and anti-cache on the URL that will be requested (gh-1732)
    			s.url = cacheURL + uncached;

    		// Change '%20' to '+' if this is encoded form body content (gh-2658)
    		} else if ( s.data && s.processData &&
    			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
    			s.data = s.data.replace( r20, "+" );
    		}

    		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    		if ( s.ifModified ) {
    			if ( jQuery.lastModified[ cacheURL ] ) {
    				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
    			}
    			if ( jQuery.etag[ cacheURL ] ) {
    				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
    			}
    		}

    		// Set the correct header, if data is being sent
    		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
    			jqXHR.setRequestHeader( "Content-Type", s.contentType );
    		}

    		// Set the Accepts header for the server, depending on the dataType
    		jqXHR.setRequestHeader(
    			"Accept",
    			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
    				s.accepts[ s.dataTypes[ 0 ] ] +
    					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
    				s.accepts[ "*" ]
    		);

    		// Check for headers option
    		for ( i in s.headers ) {
    			jqXHR.setRequestHeader( i, s.headers[ i ] );
    		}

    		// Allow custom headers/mimetypes and early abort
    		if ( s.beforeSend &&
    			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

    			// Abort if not done already and return
    			return jqXHR.abort();
    		}

    		// Aborting is no longer a cancellation
    		strAbort = "abort";

    		// Install callbacks on deferreds
    		completeDeferred.add( s.complete );
    		jqXHR.done( s.success );
    		jqXHR.fail( s.error );

    		// Get transport
    		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    		// If no transport, we auto-abort
    		if ( !transport ) {
    			done( -1, "No Transport" );
    		} else {
    			jqXHR.readyState = 1;

    			// Send global event
    			if ( fireGlobals ) {
    				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
    			}

    			// If request was aborted inside ajaxSend, stop there
    			if ( completed ) {
    				return jqXHR;
    			}

    			// Timeout
    			if ( s.async && s.timeout > 0 ) {
    				timeoutTimer = window.setTimeout( function() {
    					jqXHR.abort( "timeout" );
    				}, s.timeout );
    			}

    			try {
    				completed = false;
    				transport.send( requestHeaders, done );
    			} catch ( e ) {

    				// Rethrow post-completion exceptions
    				if ( completed ) {
    					throw e;
    				}

    				// Propagate others as results
    				done( -1, e );
    			}
    		}

    		// Callback for when everything is done
    		function done( status, nativeStatusText, responses, headers ) {
    			var isSuccess, success, error, response, modified,
    				statusText = nativeStatusText;

    			// Ignore repeat invocations
    			if ( completed ) {
    				return;
    			}

    			completed = true;

    			// Clear timeout if it exists
    			if ( timeoutTimer ) {
    				window.clearTimeout( timeoutTimer );
    			}

    			// Dereference transport for early garbage collection
    			// (no matter how long the jqXHR object will be used)
    			transport = undefined;

    			// Cache response headers
    			responseHeadersString = headers || "";

    			// Set readyState
    			jqXHR.readyState = status > 0 ? 4 : 0;

    			// Determine if successful
    			isSuccess = status >= 200 && status < 300 || status === 304;

    			// Get response data
    			if ( responses ) {
    				response = ajaxHandleResponses( s, jqXHR, responses );
    			}

    			// Use a noop converter for missing script
    			if ( !isSuccess && jQuery.inArray( "script", s.dataTypes ) > -1 ) {
    				s.converters[ "text script" ] = function() {};
    			}

    			// Convert no matter what (that way responseXXX fields are always set)
    			response = ajaxConvert( s, response, jqXHR, isSuccess );

    			// If successful, handle type chaining
    			if ( isSuccess ) {

    				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    				if ( s.ifModified ) {
    					modified = jqXHR.getResponseHeader( "Last-Modified" );
    					if ( modified ) {
    						jQuery.lastModified[ cacheURL ] = modified;
    					}
    					modified = jqXHR.getResponseHeader( "etag" );
    					if ( modified ) {
    						jQuery.etag[ cacheURL ] = modified;
    					}
    				}

    				// if no content
    				if ( status === 204 || s.type === "HEAD" ) {
    					statusText = "nocontent";

    				// if not modified
    				} else if ( status === 304 ) {
    					statusText = "notmodified";

    				// If we have data, let's convert it
    				} else {
    					statusText = response.state;
    					success = response.data;
    					error = response.error;
    					isSuccess = !error;
    				}
    			} else {

    				// Extract error from statusText and normalize for non-aborts
    				error = statusText;
    				if ( status || !statusText ) {
    					statusText = "error";
    					if ( status < 0 ) {
    						status = 0;
    					}
    				}
    			}

    			// Set data for the fake xhr object
    			jqXHR.status = status;
    			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

    			// Success/Error
    			if ( isSuccess ) {
    				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
    			} else {
    				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
    			}

    			// Status-dependent callbacks
    			jqXHR.statusCode( statusCode );
    			statusCode = undefined;

    			if ( fireGlobals ) {
    				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
    					[ jqXHR, s, isSuccess ? success : error ] );
    			}

    			// Complete
    			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

    			if ( fireGlobals ) {
    				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

    				// Handle the global AJAX counter
    				if ( !( --jQuery.active ) ) {
    					jQuery.event.trigger( "ajaxStop" );
    				}
    			}
    		}

    		return jqXHR;
    	},

    	getJSON: function( url, data, callback ) {
    		return jQuery.get( url, data, callback, "json" );
    	},

    	getScript: function( url, callback ) {
    		return jQuery.get( url, undefined, callback, "script" );
    	}
    } );

    jQuery.each( [ "get", "post" ], function( _i, method ) {
    	jQuery[ method ] = function( url, data, callback, type ) {

    		// Shift arguments if data argument was omitted
    		if ( isFunction( data ) ) {
    			type = type || callback;
    			callback = data;
    			data = undefined;
    		}

    		// The url can be an options object (which then must have .url)
    		return jQuery.ajax( jQuery.extend( {
    			url: url,
    			type: method,
    			dataType: type,
    			data: data,
    			success: callback
    		}, jQuery.isPlainObject( url ) && url ) );
    	};
    } );

    jQuery.ajaxPrefilter( function( s ) {
    	var i;
    	for ( i in s.headers ) {
    		if ( i.toLowerCase() === "content-type" ) {
    			s.contentType = s.headers[ i ] || "";
    		}
    	}
    } );


    jQuery._evalUrl = function( url, options, doc ) {
    	return jQuery.ajax( {
    		url: url,

    		// Make this explicit, since user can override this through ajaxSetup (#11264)
    		type: "GET",
    		dataType: "script",
    		cache: true,
    		async: false,
    		global: false,

    		// Only evaluate the response if it is successful (gh-4126)
    		// dataFilter is not invoked for failure responses, so using it instead
    		// of the default converter is kludgy but it works.
    		converters: {
    			"text script": function() {}
    		},
    		dataFilter: function( response ) {
    			jQuery.globalEval( response, options, doc );
    		}
    	} );
    };


    jQuery.fn.extend( {
    	wrapAll: function( html ) {
    		var wrap;

    		if ( this[ 0 ] ) {
    			if ( isFunction( html ) ) {
    				html = html.call( this[ 0 ] );
    			}

    			// The elements to wrap the target around
    			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

    			if ( this[ 0 ].parentNode ) {
    				wrap.insertBefore( this[ 0 ] );
    			}

    			wrap.map( function() {
    				var elem = this;

    				while ( elem.firstElementChild ) {
    					elem = elem.firstElementChild;
    				}

    				return elem;
    			} ).append( this );
    		}

    		return this;
    	},

    	wrapInner: function( html ) {
    		if ( isFunction( html ) ) {
    			return this.each( function( i ) {
    				jQuery( this ).wrapInner( html.call( this, i ) );
    			} );
    		}

    		return this.each( function() {
    			var self = jQuery( this ),
    				contents = self.contents();

    			if ( contents.length ) {
    				contents.wrapAll( html );

    			} else {
    				self.append( html );
    			}
    		} );
    	},

    	wrap: function( html ) {
    		var htmlIsFunction = isFunction( html );

    		return this.each( function( i ) {
    			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
    		} );
    	},

    	unwrap: function( selector ) {
    		this.parent( selector ).not( "body" ).each( function() {
    			jQuery( this ).replaceWith( this.childNodes );
    		} );
    		return this;
    	}
    } );


    jQuery.expr.pseudos.hidden = function( elem ) {
    	return !jQuery.expr.pseudos.visible( elem );
    };
    jQuery.expr.pseudos.visible = function( elem ) {
    	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
    };




    jQuery.ajaxSettings.xhr = function() {
    	try {
    		return new window.XMLHttpRequest();
    	} catch ( e ) {}
    };

    var xhrSuccessStatus = {

    		// File protocol always yields status code 0, assume 200
    		0: 200,

    		// Support: IE <=9 only
    		// #1450: sometimes IE returns 1223 when it should be 204
    		1223: 204
    	},
    	xhrSupported = jQuery.ajaxSettings.xhr();

    support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
    support.ajax = xhrSupported = !!xhrSupported;

    jQuery.ajaxTransport( function( options ) {
    	var callback, errorCallback;

    	// Cross domain only allowed if supported through XMLHttpRequest
    	if ( support.cors || xhrSupported && !options.crossDomain ) {
    		return {
    			send: function( headers, complete ) {
    				var i,
    					xhr = options.xhr();

    				xhr.open(
    					options.type,
    					options.url,
    					options.async,
    					options.username,
    					options.password
    				);

    				// Apply custom fields if provided
    				if ( options.xhrFields ) {
    					for ( i in options.xhrFields ) {
    						xhr[ i ] = options.xhrFields[ i ];
    					}
    				}

    				// Override mime type if needed
    				if ( options.mimeType && xhr.overrideMimeType ) {
    					xhr.overrideMimeType( options.mimeType );
    				}

    				// X-Requested-With header
    				// For cross-domain requests, seeing as conditions for a preflight are
    				// akin to a jigsaw puzzle, we simply never set it to be sure.
    				// (it can always be set on a per-request basis or even using ajaxSetup)
    				// For same-domain requests, won't change header if already provided.
    				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
    					headers[ "X-Requested-With" ] = "XMLHttpRequest";
    				}

    				// Set headers
    				for ( i in headers ) {
    					xhr.setRequestHeader( i, headers[ i ] );
    				}

    				// Callback
    				callback = function( type ) {
    					return function() {
    						if ( callback ) {
    							callback = errorCallback = xhr.onload =
    								xhr.onerror = xhr.onabort = xhr.ontimeout =
    									xhr.onreadystatechange = null;

    							if ( type === "abort" ) {
    								xhr.abort();
    							} else if ( type === "error" ) {

    								// Support: IE <=9 only
    								// On a manual native abort, IE9 throws
    								// errors on any property access that is not readyState
    								if ( typeof xhr.status !== "number" ) {
    									complete( 0, "error" );
    								} else {
    									complete(

    										// File: protocol always yields status 0; see #8605, #14207
    										xhr.status,
    										xhr.statusText
    									);
    								}
    							} else {
    								complete(
    									xhrSuccessStatus[ xhr.status ] || xhr.status,
    									xhr.statusText,

    									// Support: IE <=9 only
    									// IE9 has no XHR2 but throws on binary (trac-11426)
    									// For XHR2 non-text, let the caller handle it (gh-2498)
    									( xhr.responseType || "text" ) !== "text"  ||
    									typeof xhr.responseText !== "string" ?
    										{ binary: xhr.response } :
    										{ text: xhr.responseText },
    									xhr.getAllResponseHeaders()
    								);
    							}
    						}
    					};
    				};

    				// Listen to events
    				xhr.onload = callback();
    				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

    				// Support: IE 9 only
    				// Use onreadystatechange to replace onabort
    				// to handle uncaught aborts
    				if ( xhr.onabort !== undefined ) {
    					xhr.onabort = errorCallback;
    				} else {
    					xhr.onreadystatechange = function() {

    						// Check readyState before timeout as it changes
    						if ( xhr.readyState === 4 ) {

    							// Allow onerror to be called first,
    							// but that will not handle a native abort
    							// Also, save errorCallback to a variable
    							// as xhr.onerror cannot be accessed
    							window.setTimeout( function() {
    								if ( callback ) {
    									errorCallback();
    								}
    							} );
    						}
    					};
    				}

    				// Create the abort callback
    				callback = callback( "abort" );

    				try {

    					// Do send the request (this may raise an exception)
    					xhr.send( options.hasContent && options.data || null );
    				} catch ( e ) {

    					// #14683: Only rethrow if this hasn't been notified as an error yet
    					if ( callback ) {
    						throw e;
    					}
    				}
    			},

    			abort: function() {
    				if ( callback ) {
    					callback();
    				}
    			}
    		};
    	}
    } );




    // Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
    jQuery.ajaxPrefilter( function( s ) {
    	if ( s.crossDomain ) {
    		s.contents.script = false;
    	}
    } );

    // Install script dataType
    jQuery.ajaxSetup( {
    	accepts: {
    		script: "text/javascript, application/javascript, " +
    			"application/ecmascript, application/x-ecmascript"
    	},
    	contents: {
    		script: /\b(?:java|ecma)script\b/
    	},
    	converters: {
    		"text script": function( text ) {
    			jQuery.globalEval( text );
    			return text;
    		}
    	}
    } );

    // Handle cache's special case and crossDomain
    jQuery.ajaxPrefilter( "script", function( s ) {
    	if ( s.cache === undefined ) {
    		s.cache = false;
    	}
    	if ( s.crossDomain ) {
    		s.type = "GET";
    	}
    } );

    // Bind script tag hack transport
    jQuery.ajaxTransport( "script", function( s ) {

    	// This transport only deals with cross domain or forced-by-attrs requests
    	if ( s.crossDomain || s.scriptAttrs ) {
    		var script, callback;
    		return {
    			send: function( _, complete ) {
    				script = jQuery( "<script>" )
    					.attr( s.scriptAttrs || {} )
    					.prop( { charset: s.scriptCharset, src: s.url } )
    					.on( "load error", callback = function( evt ) {
    						script.remove();
    						callback = null;
    						if ( evt ) {
    							complete( evt.type === "error" ? 404 : 200, evt.type );
    						}
    					} );

    				// Use native DOM manipulation to avoid our domManip AJAX trickery
    				document.head.appendChild( script[ 0 ] );
    			},
    			abort: function() {
    				if ( callback ) {
    					callback();
    				}
    			}
    		};
    	}
    } );




    var oldCallbacks = [],
    	rjsonp = /(=)\?(?=&|$)|\?\?/;

    // Default jsonp settings
    jQuery.ajaxSetup( {
    	jsonp: "callback",
    	jsonpCallback: function() {
    		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
    		this[ callback ] = true;
    		return callback;
    	}
    } );

    // Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

    	var callbackName, overwritten, responseContainer,
    		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
    			"url" :
    			typeof s.data === "string" &&
    				( s.contentType || "" )
    					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
    				rjsonp.test( s.data ) && "data"
    		);

    	// Handle iff the expected data type is "jsonp" or we have a parameter to set
    	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

    		// Get callback name, remembering preexisting value associated with it
    		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
    			s.jsonpCallback() :
    			s.jsonpCallback;

    		// Insert callback into url or form data
    		if ( jsonProp ) {
    			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
    		} else if ( s.jsonp !== false ) {
    			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    		}

    		// Use data converter to retrieve json after script execution
    		s.converters[ "script json" ] = function() {
    			if ( !responseContainer ) {
    				jQuery.error( callbackName + " was not called" );
    			}
    			return responseContainer[ 0 ];
    		};

    		// Force json dataType
    		s.dataTypes[ 0 ] = "json";

    		// Install callback
    		overwritten = window[ callbackName ];
    		window[ callbackName ] = function() {
    			responseContainer = arguments;
    		};

    		// Clean-up function (fires after converters)
    		jqXHR.always( function() {

    			// If previous value didn't exist - remove it
    			if ( overwritten === undefined ) {
    				jQuery( window ).removeProp( callbackName );

    			// Otherwise restore preexisting value
    			} else {
    				window[ callbackName ] = overwritten;
    			}

    			// Save back as free
    			if ( s[ callbackName ] ) {

    				// Make sure that re-using the options doesn't screw things around
    				s.jsonpCallback = originalSettings.jsonpCallback;

    				// Save the callback name for future use
    				oldCallbacks.push( callbackName );
    			}

    			// Call if it was a function and we have a response
    			if ( responseContainer && isFunction( overwritten ) ) {
    				overwritten( responseContainer[ 0 ] );
    			}

    			responseContainer = overwritten = undefined;
    		} );

    		// Delegate to script
    		return "script";
    	}
    } );




    // Support: Safari 8 only
    // In Safari 8 documents created via document.implementation.createHTMLDocument
    // collapse sibling forms: the second one becomes a child of the first one.
    // Because of that, this security measure has to be disabled in Safari 8.
    // https://bugs.webkit.org/show_bug.cgi?id=137337
    support.createHTMLDocument = ( function() {
    	var body = document.implementation.createHTMLDocument( "" ).body;
    	body.innerHTML = "<form></form><form></form>";
    	return body.childNodes.length === 2;
    } )();


    // Argument "data" should be string of html
    // context (optional): If specified, the fragment will be created in this context,
    // defaults to document
    // keepScripts (optional): If true, will include scripts passed in the html string
    jQuery.parseHTML = function( data, context, keepScripts ) {
    	if ( typeof data !== "string" ) {
    		return [];
    	}
    	if ( typeof context === "boolean" ) {
    		keepScripts = context;
    		context = false;
    	}

    	var base, parsed, scripts;

    	if ( !context ) {

    		// Stop scripts or inline event handlers from being executed immediately
    		// by using document.implementation
    		if ( support.createHTMLDocument ) {
    			context = document.implementation.createHTMLDocument( "" );

    			// Set the base href for the created document
    			// so any parsed elements with URLs
    			// are based on the document's URL (gh-2965)
    			base = context.createElement( "base" );
    			base.href = document.location.href;
    			context.head.appendChild( base );
    		} else {
    			context = document;
    		}
    	}

    	parsed = rsingleTag.exec( data );
    	scripts = !keepScripts && [];

    	// Single tag
    	if ( parsed ) {
    		return [ context.createElement( parsed[ 1 ] ) ];
    	}

    	parsed = buildFragment( [ data ], context, scripts );

    	if ( scripts && scripts.length ) {
    		jQuery( scripts ).remove();
    	}

    	return jQuery.merge( [], parsed.childNodes );
    };


    /**
     * Load a url into a page
     */
    jQuery.fn.load = function( url, params, callback ) {
    	var selector, type, response,
    		self = this,
    		off = url.indexOf( " " );

    	if ( off > -1 ) {
    		selector = stripAndCollapse( url.slice( off ) );
    		url = url.slice( 0, off );
    	}

    	// If it's a function
    	if ( isFunction( params ) ) {

    		// We assume that it's the callback
    		callback = params;
    		params = undefined;

    	// Otherwise, build a param string
    	} else if ( params && typeof params === "object" ) {
    		type = "POST";
    	}

    	// If we have elements to modify, make the request
    	if ( self.length > 0 ) {
    		jQuery.ajax( {
    			url: url,

    			// If "type" variable is undefined, then "GET" method will be used.
    			// Make value of this field explicit since
    			// user can override it through ajaxSetup method
    			type: type || "GET",
    			dataType: "html",
    			data: params
    		} ).done( function( responseText ) {

    			// Save response for use in complete callback
    			response = arguments;

    			self.html( selector ?

    				// If a selector was specified, locate the right elements in a dummy div
    				// Exclude scripts to avoid IE 'Permission Denied' errors
    				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

    				// Otherwise use the full result
    				responseText );

    		// If the request succeeds, this function gets "data", "status", "jqXHR"
    		// but they are ignored because response was set above.
    		// If it fails, this function gets "jqXHR", "status", "error"
    		} ).always( callback && function( jqXHR, status ) {
    			self.each( function() {
    				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
    			} );
    		} );
    	}

    	return this;
    };




    jQuery.expr.pseudos.animated = function( elem ) {
    	return jQuery.grep( jQuery.timers, function( fn ) {
    		return elem === fn.elem;
    	} ).length;
    };




    jQuery.offset = {
    	setOffset: function( elem, options, i ) {
    		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
    			position = jQuery.css( elem, "position" ),
    			curElem = jQuery( elem ),
    			props = {};

    		// Set position first, in-case top/left are set even on static elem
    		if ( position === "static" ) {
    			elem.style.position = "relative";
    		}

    		curOffset = curElem.offset();
    		curCSSTop = jQuery.css( elem, "top" );
    		curCSSLeft = jQuery.css( elem, "left" );
    		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
    			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

    		// Need to be able to calculate position if either
    		// top or left is auto and position is either absolute or fixed
    		if ( calculatePosition ) {
    			curPosition = curElem.position();
    			curTop = curPosition.top;
    			curLeft = curPosition.left;

    		} else {
    			curTop = parseFloat( curCSSTop ) || 0;
    			curLeft = parseFloat( curCSSLeft ) || 0;
    		}

    		if ( isFunction( options ) ) {

    			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
    			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
    		}

    		if ( options.top != null ) {
    			props.top = ( options.top - curOffset.top ) + curTop;
    		}
    		if ( options.left != null ) {
    			props.left = ( options.left - curOffset.left ) + curLeft;
    		}

    		if ( "using" in options ) {
    			options.using.call( elem, props );

    		} else {
    			if ( typeof props.top === "number" ) {
    				props.top += "px";
    			}
    			if ( typeof props.left === "number" ) {
    				props.left += "px";
    			}
    			curElem.css( props );
    		}
    	}
    };

    jQuery.fn.extend( {

    	// offset() relates an element's border box to the document origin
    	offset: function( options ) {

    		// Preserve chaining for setter
    		if ( arguments.length ) {
    			return options === undefined ?
    				this :
    				this.each( function( i ) {
    					jQuery.offset.setOffset( this, options, i );
    				} );
    		}

    		var rect, win,
    			elem = this[ 0 ];

    		if ( !elem ) {
    			return;
    		}

    		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
    		// Support: IE <=11 only
    		// Running getBoundingClientRect on a
    		// disconnected node in IE throws an error
    		if ( !elem.getClientRects().length ) {
    			return { top: 0, left: 0 };
    		}

    		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
    		rect = elem.getBoundingClientRect();
    		win = elem.ownerDocument.defaultView;
    		return {
    			top: rect.top + win.pageYOffset,
    			left: rect.left + win.pageXOffset
    		};
    	},

    	// position() relates an element's margin box to its offset parent's padding box
    	// This corresponds to the behavior of CSS absolute positioning
    	position: function() {
    		if ( !this[ 0 ] ) {
    			return;
    		}

    		var offsetParent, offset, doc,
    			elem = this[ 0 ],
    			parentOffset = { top: 0, left: 0 };

    		// position:fixed elements are offset from the viewport, which itself always has zero offset
    		if ( jQuery.css( elem, "position" ) === "fixed" ) {

    			// Assume position:fixed implies availability of getBoundingClientRect
    			offset = elem.getBoundingClientRect();

    		} else {
    			offset = this.offset();

    			// Account for the *real* offset parent, which can be the document or its root element
    			// when a statically positioned element is identified
    			doc = elem.ownerDocument;
    			offsetParent = elem.offsetParent || doc.documentElement;
    			while ( offsetParent &&
    				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
    				jQuery.css( offsetParent, "position" ) === "static" ) {

    				offsetParent = offsetParent.parentNode;
    			}
    			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

    				// Incorporate borders into its offset, since they are outside its content origin
    				parentOffset = jQuery( offsetParent ).offset();
    				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
    				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
    			}
    		}

    		// Subtract parent offsets and element margins
    		return {
    			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
    			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
    		};
    	},

    	// This method will return documentElement in the following cases:
    	// 1) For the element inside the iframe without offsetParent, this method will return
    	//    documentElement of the parent window
    	// 2) For the hidden or detached element
    	// 3) For body or html element, i.e. in case of the html node - it will return itself
    	//
    	// but those exceptions were never presented as a real life use-cases
    	// and might be considered as more preferable results.
    	//
    	// This logic, however, is not guaranteed and can change at any point in the future
    	offsetParent: function() {
    		return this.map( function() {
    			var offsetParent = this.offsetParent;

    			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
    				offsetParent = offsetParent.offsetParent;
    			}

    			return offsetParent || documentElement;
    		} );
    	}
    } );

    // Create scrollLeft and scrollTop methods
    jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
    	var top = "pageYOffset" === prop;

    	jQuery.fn[ method ] = function( val ) {
    		return access( this, function( elem, method, val ) {

    			// Coalesce documents and windows
    			var win;
    			if ( isWindow( elem ) ) {
    				win = elem;
    			} else if ( elem.nodeType === 9 ) {
    				win = elem.defaultView;
    			}

    			if ( val === undefined ) {
    				return win ? win[ prop ] : elem[ method ];
    			}

    			if ( win ) {
    				win.scrollTo(
    					!top ? val : win.pageXOffset,
    					top ? val : win.pageYOffset
    				);

    			} else {
    				elem[ method ] = val;
    			}
    		}, method, val, arguments.length );
    	};
    } );

    // Support: Safari <=7 - 9.1, Chrome <=37 - 49
    // Add the top/left cssHooks using jQuery.fn.position
    // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
    // Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
    // getComputedStyle returns percent when specified for top/left/bottom/right;
    // rather than make the css module depend on the offset module, just check for it here
    jQuery.each( [ "top", "left" ], function( _i, prop ) {
    	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
    		function( elem, computed ) {
    			if ( computed ) {
    				computed = curCSS( elem, prop );

    				// If curCSS returns percentage, fallback to offset
    				return rnumnonpx.test( computed ) ?
    					jQuery( elem ).position()[ prop ] + "px" :
    					computed;
    			}
    		}
    	);
    } );


    // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
    jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
    	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
    		function( defaultExtra, funcName ) {

    		// Margin is only for outerHeight, outerWidth
    		jQuery.fn[ funcName ] = function( margin, value ) {
    			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
    				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

    			return access( this, function( elem, type, value ) {
    				var doc;

    				if ( isWindow( elem ) ) {

    					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
    					return funcName.indexOf( "outer" ) === 0 ?
    						elem[ "inner" + name ] :
    						elem.document.documentElement[ "client" + name ];
    				}

    				// Get document width or height
    				if ( elem.nodeType === 9 ) {
    					doc = elem.documentElement;

    					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
    					// whichever is greatest
    					return Math.max(
    						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
    						elem.body[ "offset" + name ], doc[ "offset" + name ],
    						doc[ "client" + name ]
    					);
    				}

    				return value === undefined ?

    					// Get width or height on the element, requesting but not forcing parseFloat
    					jQuery.css( elem, type, extra ) :

    					// Set width or height on the element
    					jQuery.style( elem, type, value, extra );
    			}, type, chainable ? margin : undefined, chainable );
    		};
    	} );
    } );


    jQuery.each( [
    	"ajaxStart",
    	"ajaxStop",
    	"ajaxComplete",
    	"ajaxError",
    	"ajaxSuccess",
    	"ajaxSend"
    ], function( _i, type ) {
    	jQuery.fn[ type ] = function( fn ) {
    		return this.on( type, fn );
    	};
    } );




    jQuery.fn.extend( {

    	bind: function( types, data, fn ) {
    		return this.on( types, null, data, fn );
    	},
    	unbind: function( types, fn ) {
    		return this.off( types, null, fn );
    	},

    	delegate: function( selector, types, data, fn ) {
    		return this.on( types, selector, data, fn );
    	},
    	undelegate: function( selector, types, fn ) {

    		// ( namespace ) or ( selector, types [, fn] )
    		return arguments.length === 1 ?
    			this.off( selector, "**" ) :
    			this.off( types, selector || "**", fn );
    	},

    	hover: function( fnOver, fnOut ) {
    		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
    	}
    } );

    jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
    	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
    	function( _i, name ) {

    		// Handle event binding
    		jQuery.fn[ name ] = function( data, fn ) {
    			return arguments.length > 0 ?
    				this.on( name, null, data, fn ) :
    				this.trigger( name );
    		};
    	} );




    // Support: Android <=4.0 only
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    // Bind a function to a context, optionally partially applying any
    // arguments.
    // jQuery.proxy is deprecated to promote standards (specifically Function#bind)
    // However, it is not slated for removal any time soon
    jQuery.proxy = function( fn, context ) {
    	var tmp, args, proxy;

    	if ( typeof context === "string" ) {
    		tmp = fn[ context ];
    		context = fn;
    		fn = tmp;
    	}

    	// Quick check to determine if target is callable, in the spec
    	// this throws a TypeError, but we will just return undefined.
    	if ( !isFunction( fn ) ) {
    		return undefined;
    	}

    	// Simulated bind
    	args = slice.call( arguments, 2 );
    	proxy = function() {
    		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
    	};

    	// Set the guid of unique handler to the same of original handler, so it can be removed
    	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    	return proxy;
    };

    jQuery.holdReady = function( hold ) {
    	if ( hold ) {
    		jQuery.readyWait++;
    	} else {
    		jQuery.ready( true );
    	}
    };
    jQuery.isArray = Array.isArray;
    jQuery.parseJSON = JSON.parse;
    jQuery.nodeName = nodeName;
    jQuery.isFunction = isFunction;
    jQuery.isWindow = isWindow;
    jQuery.camelCase = camelCase;
    jQuery.type = toType;

    jQuery.now = Date.now;

    jQuery.isNumeric = function( obj ) {

    	// As of jQuery 3.0, isNumeric is limited to
    	// strings and numbers (primitives or objects)
    	// that can be coerced to finite numbers (gh-2662)
    	var type = jQuery.type( obj );
    	return ( type === "number" || type === "string" ) &&

    		// parseFloat NaNs numeric-cast false positives ("")
    		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    		// subtraction forces infinities to NaN
    		!isNaN( obj - parseFloat( obj ) );
    };

    jQuery.trim = function( text ) {
    	return text == null ?
    		"" :
    		( text + "" ).replace( rtrim, "" );
    };




    var

    	// Map over jQuery in case of overwrite
    	_jQuery = window.jQuery,

    	// Map over the $ in case of overwrite
    	_$ = window.$;

    jQuery.noConflict = function( deep ) {
    	if ( window.$ === jQuery ) {
    		window.$ = _$;
    	}

    	if ( deep && window.jQuery === jQuery ) {
    		window.jQuery = _jQuery;
    	}

    	return jQuery;
    };

    // Expose jQuery and $ identifiers, even in AMD
    // (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
    // and CommonJS for browser emulators (#13566)
    if ( typeof noGlobal === "undefined" ) {
    	window.jQuery = window.$ = jQuery;
    }




    return jQuery;
    } );
    });

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.29.4 */

    const file$6 = "node_modules\\svelte-icons\\components\\IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block$3(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file$6, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file$6, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconBase", slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\fa\FaHome.svelte generated by Svelte v3.29.4 */
    const file$7 = "node_modules\\svelte-icons\\fa\\FaHome.svelte";

    // (4:8) <IconBase viewBox="0 0 576 512" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z");
    			add_location(path, file$7, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 576 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 576 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaHome", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaHome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaHome",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaCoins.svelte generated by Svelte v3.29.4 */
    const file$8 = "node_modules\\svelte-icons\\fa\\FaCoins.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M0 405.3V448c0 35.3 86 64 192 64s192-28.7 192-64v-42.7C342.7 434.4 267.2 448 192 448S41.3 434.4 0 405.3zM320 128c106 0 192-28.7 192-64S426 0 320 0 128 28.7 128 64s86 64 192 64zM0 300.4V352c0 35.3 86 64 192 64s192-28.7 192-64v-51.6c-41.3 34-116.9 51.6-192 51.6S41.3 334.4 0 300.4zm416 11c57.3-11.1 96-31.7 96-55.4v-42.7c-23.2 16.4-57.3 27.6-96 34.5v63.6zM192 160C86 160 0 195.8 0 240s86 80 192 80 192-35.8 192-80-86-80-192-80zm219.3 56.3c60-10.8 100.7-32 100.7-56.3v-42.7c-35.5 25.1-96.5 38.6-160.7 41.8 29.5 14.3 51.2 33.5 60 57.2z");
    			add_location(path, file$8, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaCoins", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaCoins extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaCoins",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaHdd.svelte generated by Svelte v3.29.4 */
    const file$9 = "node_modules\\svelte-icons\\fa\\FaHdd.svelte";

    // (4:8) <IconBase viewBox="0 0 576 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M576 304v96c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48v-96c0-26.51 21.49-48 48-48h480c26.51 0 48 21.49 48 48zm-48-80a79.557 79.557 0 0 1 30.777 6.165L462.25 85.374A48.003 48.003 0 0 0 422.311 64H153.689a48 48 0 0 0-39.938 21.374L17.223 230.165A79.557 79.557 0 0 1 48 224h480zm-48 96c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zm-96 0c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z");
    			add_location(path, file$9, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 576 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 576 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaHdd", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaHdd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaHdd",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaDungeon.svelte generated by Svelte v3.29.4 */
    const file$a = "node_modules\\svelte-icons\\fa\\FaDungeon.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M128.73 195.32l-82.81-51.76c-8.04-5.02-18.99-2.17-22.93 6.45A254.19 254.19 0 0 0 .54 239.28C-.05 248.37 7.59 256 16.69 256h97.13c7.96 0 14.08-6.25 15.01-14.16 1.09-9.33 3.24-18.33 6.24-26.94 2.56-7.34.25-15.46-6.34-19.58zM319.03 8C298.86 2.82 277.77 0 256 0s-42.86 2.82-63.03 8c-9.17 2.35-13.91 12.6-10.39 21.39l37.47 104.03A16.003 16.003 0 0 0 235.1 144h41.8c6.75 0 12.77-4.23 15.05-10.58l37.47-104.03c3.52-8.79-1.22-19.03-10.39-21.39zM112 288H16c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h96c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16zm0 128H16c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h96c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16zm77.31-283.67l-36.32-90.8c-3.53-8.83-14.13-12.99-22.42-8.31a257.308 257.308 0 0 0-71.61 59.89c-6.06 7.32-3.85 18.48 4.22 23.52l82.93 51.83c6.51 4.07 14.66 2.62 20.11-2.79 5.18-5.15 10.79-9.85 16.79-14.05 6.28-4.41 9.15-12.17 6.3-19.29zM398.18 256h97.13c9.1 0 16.74-7.63 16.15-16.72a254.135 254.135 0 0 0-22.45-89.27c-3.94-8.62-14.89-11.47-22.93-6.45l-82.81 51.76c-6.59 4.12-8.9 12.24-6.34 19.58 3.01 8.61 5.15 17.62 6.24 26.94.93 7.91 7.05 14.16 15.01 14.16zm54.85-162.89a257.308 257.308 0 0 0-71.61-59.89c-8.28-4.68-18.88-.52-22.42 8.31l-36.32 90.8c-2.85 7.12.02 14.88 6.3 19.28 6 4.2 11.61 8.9 16.79 14.05 5.44 5.41 13.6 6.86 20.11 2.79l82.93-51.83c8.07-5.03 10.29-16.19 4.22-23.51zM496 288h-96c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h96c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16zm0 128h-96c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h96c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16zM240 177.62V472c0 4.42 3.58 8 8 8h16c4.42 0 8-3.58 8-8V177.62c-5.23-.89-10.52-1.62-16-1.62s-10.77.73-16 1.62zm-64 41.51V472c0 4.42 3.58 8 8 8h16c4.42 0 8-3.58 8-8V189.36c-12.78 7.45-23.84 17.47-32 29.77zm128-29.77V472c0 4.42 3.58 8 8 8h16c4.42 0 8-3.58 8-8V219.13c-8.16-12.3-19.22-22.32-32-29.77z");
    			add_location(path, file$a, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaDungeon", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaDungeon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaDungeon",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaServer.svelte generated by Svelte v3.29.4 */
    const file$b = "node_modules\\svelte-icons\\fa\\FaServer.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M480 160H32c-17.673 0-32-14.327-32-32V64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z");
    			add_location(path, file$b, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaServer", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaServer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaServer",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaAlignCenter.svelte generated by Svelte v3.29.4 */
    const file$c = "node_modules\\svelte-icons\\fa\\FaAlignCenter.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M432 160H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0 256H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM108.1 96h231.81A12.09 12.09 0 0 0 352 83.9V44.09A12.09 12.09 0 0 0 339.91 32H108.1A12.09 12.09 0 0 0 96 44.09V83.9A12.1 12.1 0 0 0 108.1 96zm231.81 256A12.09 12.09 0 0 0 352 339.9v-39.81A12.09 12.09 0 0 0 339.91 288H108.1A12.09 12.09 0 0 0 96 300.09v39.81a12.1 12.1 0 0 0 12.1 12.1z");
    			add_location(path, file$c, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaAlignCenter", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaAlignCenter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaAlignCenter",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules\carbon-icons-svelte\lib\ChevronRight16\ChevronRight16.svelte generated by Svelte v3.29.4 */

    const file$d = "node_modules\\carbon-icons-svelte\\lib\\ChevronRight16\\ChevronRight16.svelte";

    // (39:4) {#if title}
    function create_if_block$4(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$d, 39, 6, 1040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "ChevronRight16" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ width: "16" },
    		{ height: "16" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z");
    			add_location(path, file$d, 36, 2, 952);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$d, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[11], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "ChevronRight16" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ width: "16" },
    				{ height: "16" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChevronRight16", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(15, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(16, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(17, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(15, ariaLabel = $$props["aria-label"]);
    		 $$invalidate(16, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 98308) {
    			 $$invalidate(17, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 229472) {
    			 $$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class ChevronRight16 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronRight16",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ChevronRight16>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ChevronRight16>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\Checkbox\InlineCheckbox.svelte generated by Svelte v3.29.4 */

    const file$e = "node_modules\\carbon-components-svelte\\src\\Checkbox\\InlineCheckbox.svelte";

    function create_fragment$f(ctx) {
    	let input;
    	let input_checked_value;
    	let input_aria_checked_value;
    	let t;
    	let label;
    	let label_aria_label_value;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ type: "checkbox" },
    		{
    			checked: input_checked_value = /*indeterminate*/ ctx[2] ? false : /*checked*/ ctx[1]
    		},
    		{ indeterminate: /*indeterminate*/ ctx[2] },
    		{ id: /*id*/ ctx[4] },
    		/*$$restProps*/ ctx[5],
    		{ "aria-label": undefined },
    		{
    			"aria-checked": input_aria_checked_value = /*indeterminate*/ ctx[2] ? "mixed" : /*checked*/ ctx[1]
    		}
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			label = element("label");
    			set_attributes(input, input_data);
    			toggle_class(input, "bx--checkbox", true);
    			add_location(input, file$e, 32, 0, 679);
    			attr_dev(label, "for", /*id*/ ctx[4]);
    			attr_dev(label, "title", /*title*/ ctx[3]);
    			attr_dev(label, "aria-label", label_aria_label_value = /*$$props*/ ctx[6]["aria-label"]);
    			toggle_class(label, "bx--checkbox-label", true);
    			add_location(label, file$e, 44, 0, 960);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[8](input);
    			insert_dev(target, t, anchor);
    			insert_dev(target, label, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*change_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "checkbox" },
    				dirty & /*indeterminate, checked*/ 6 && input_checked_value !== (input_checked_value = /*indeterminate*/ ctx[2] ? false : /*checked*/ ctx[1]) && { checked: input_checked_value },
    				dirty & /*indeterminate*/ 4 && { indeterminate: /*indeterminate*/ ctx[2] },
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
    				{ "aria-label": undefined },
    				dirty & /*indeterminate, checked*/ 6 && input_aria_checked_value !== (input_aria_checked_value = /*indeterminate*/ ctx[2] ? "mixed" : /*checked*/ ctx[1]) && { "aria-checked": input_aria_checked_value }
    			]));

    			toggle_class(input, "bx--checkbox", true);

    			if (dirty & /*id*/ 16) {
    				attr_dev(label, "for", /*id*/ ctx[4]);
    			}

    			if (dirty & /*title*/ 8) {
    				attr_dev(label, "title", /*title*/ ctx[3]);
    			}

    			if (dirty & /*$$props*/ 64 && label_aria_label_value !== (label_aria_label_value = /*$$props*/ ctx[6]["aria-label"])) {
    				attr_dev(label, "aria-label", label_aria_label_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const omit_props_names = ["checked","indeterminate","title","id","ref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InlineCheckbox", slots, []);
    	let { checked = false } = $$props;
    	let { indeterminate = false } = $$props;
    	let { title = undefined } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { ref = null } = $$props;

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("checked" in $$new_props) $$invalidate(1, checked = $$new_props.checked);
    		if ("indeterminate" in $$new_props) $$invalidate(2, indeterminate = $$new_props.indeterminate);
    		if ("title" in $$new_props) $$invalidate(3, title = $$new_props.title);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("ref" in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    	};

    	$$self.$capture_state = () => ({ checked, indeterminate, title, id, ref });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("checked" in $$props) $$invalidate(1, checked = $$new_props.checked);
    		if ("indeterminate" in $$props) $$invalidate(2, indeterminate = $$new_props.indeterminate);
    		if ("title" in $$props) $$invalidate(3, title = $$new_props.title);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("ref" in $$props) $$invalidate(0, ref = $$new_props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		ref,
    		checked,
    		indeterminate,
    		title,
    		id,
    		$$restProps,
    		$$props,
    		change_handler,
    		input_binding
    	];
    }

    class InlineCheckbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			checked: 1,
    			indeterminate: 2,
    			title: 3,
    			id: 4,
    			ref: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InlineCheckbox",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get checked() {
    		throw new Error("<InlineCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<InlineCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<InlineCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<InlineCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<InlineCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<InlineCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<InlineCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<InlineCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<InlineCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<InlineCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\RadioButton\RadioButton.svelte generated by Svelte v3.29.4 */
    const file$f = "node_modules\\carbon-components-svelte\\src\\RadioButton\\RadioButton.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[11]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = text(/*labelText*/ ctx[5]);
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "id", /*id*/ ctx[7]);
    			attr_dev(input, "name", /*name*/ ctx[8]);
    			input.checked = /*checked*/ ctx[0];
    			input.disabled = /*disabled*/ ctx[3];
    			input.value = /*value*/ ctx[2];
    			toggle_class(input, "bx--radio-button", true);
    			add_location(input, file$f, 75, 2, 1626);
    			toggle_class(span0, "bx--radio-button__appearance", true);
    			add_location(span0, file$f, 92, 4, 1977);
    			toggle_class(span1, "bx--visually-hidden", /*hideLabel*/ ctx[6]);
    			add_location(span1, file$f, 93, 4, 2039);
    			attr_dev(label, "for", /*id*/ ctx[7]);
    			toggle_class(label, "bx--radio-button__label", true);
    			add_location(label, file$f, 91, 2, 1915);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--radio-button-wrapper", true);
    			toggle_class(div, "bx--radio-button-wrapper--label-left", /*labelPosition*/ ctx[4] === "left");
    			add_location(div, file$f, 70, 0, 1482);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			/*input_binding*/ ctx[13](input);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, span0);
    			append_dev(label, t1);
    			append_dev(label, span1);
    			append_dev(span1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(input, "change", /*change_handler_1*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 128) {
    				attr_dev(input, "id", /*id*/ ctx[7]);
    			}

    			if (dirty & /*name*/ 256) {
    				attr_dev(input, "name", /*name*/ ctx[8]);
    			}

    			if (dirty & /*checked*/ 1) {
    				prop_dev(input, "checked", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 4) {
    				prop_dev(input, "value", /*value*/ ctx[2]);
    			}

    			if (dirty & /*labelText*/ 32) set_data_dev(t2, /*labelText*/ ctx[5]);

    			if (dirty & /*hideLabel*/ 64) {
    				toggle_class(span1, "bx--visually-hidden", /*hideLabel*/ ctx[6]);
    			}

    			if (dirty & /*id*/ 128) {
    				attr_dev(label, "for", /*id*/ ctx[7]);
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 2048 && /*$$restProps*/ ctx[11]]));
    			toggle_class(div, "bx--radio-button-wrapper", true);
    			toggle_class(div, "bx--radio-button-wrapper--label-left", /*labelPosition*/ ctx[4] === "left");
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"value","checked","disabled","labelPosition","labelText","hideLabel","id","name","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $selectedValue;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RadioButton", slots, []);
    	let { value = "" } = $$props;
    	let { checked = false } = $$props;
    	let { disabled = false } = $$props;
    	let { labelPosition = "right" } = $$props;
    	let { labelText = "" } = $$props;
    	let { hideLabel = false } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { name = "" } = $$props;
    	let { ref = null } = $$props;
    	const ctx = getContext("RadioButtonGroup");

    	const selectedValue = ctx
    	? ctx.selectedValue
    	: writable(checked ? value : undefined);

    	validate_store(selectedValue, "selectedValue");
    	component_subscribe($$self, selectedValue, value => $$invalidate(15, $selectedValue = value));

    	if (ctx) {
    		ctx.add({ id, checked, disabled, value });
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	const change_handler_1 = () => {
    		if (ctx) {
    			ctx.update(value);
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("value" in $$new_props) $$invalidate(2, value = $$new_props.value);
    		if ("checked" in $$new_props) $$invalidate(0, checked = $$new_props.checked);
    		if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("labelPosition" in $$new_props) $$invalidate(4, labelPosition = $$new_props.labelPosition);
    		if ("labelText" in $$new_props) $$invalidate(5, labelText = $$new_props.labelText);
    		if ("hideLabel" in $$new_props) $$invalidate(6, hideLabel = $$new_props.hideLabel);
    		if ("id" in $$new_props) $$invalidate(7, id = $$new_props.id);
    		if ("name" in $$new_props) $$invalidate(8, name = $$new_props.name);
    		if ("ref" in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		checked,
    		disabled,
    		labelPosition,
    		labelText,
    		hideLabel,
    		id,
    		name,
    		ref,
    		getContext,
    		writable,
    		ctx,
    		selectedValue,
    		$selectedValue
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("value" in $$props) $$invalidate(2, value = $$new_props.value);
    		if ("checked" in $$props) $$invalidate(0, checked = $$new_props.checked);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("labelPosition" in $$props) $$invalidate(4, labelPosition = $$new_props.labelPosition);
    		if ("labelText" in $$props) $$invalidate(5, labelText = $$new_props.labelText);
    		if ("hideLabel" in $$props) $$invalidate(6, hideLabel = $$new_props.hideLabel);
    		if ("id" in $$props) $$invalidate(7, id = $$new_props.id);
    		if ("name" in $$props) $$invalidate(8, name = $$new_props.name);
    		if ("ref" in $$props) $$invalidate(1, ref = $$new_props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedValue, value*/ 32772) {
    			 $$invalidate(0, checked = $selectedValue === value);
    		}
    	};

    	return [
    		checked,
    		ref,
    		value,
    		disabled,
    		labelPosition,
    		labelText,
    		hideLabel,
    		id,
    		name,
    		ctx,
    		selectedValue,
    		$$restProps,
    		change_handler,
    		input_binding,
    		change_handler_1
    	];
    }

    class RadioButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			value: 2,
    			checked: 0,
    			disabled: 3,
    			labelPosition: 4,
    			labelText: 5,
    			hideLabel: 6,
    			id: 7,
    			name: 8,
    			ref: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioButton",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get value() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelPosition() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelPosition(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelText() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelText(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideLabel() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideLabel(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\Table.svelte generated by Svelte v3.29.4 */

    const file$g = "node_modules\\carbon-components-svelte\\src\\DataTable\\Table.svelte";

    // (55:0) {:else}
    function create_else_block$1(ctx) {
    	let table;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let table_levels = [/*$$restProps*/ ctx[6]];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (default_slot) default_slot.c();
    			set_attributes(table, table_data);
    			toggle_class(table, "bx--data-table", true);
    			toggle_class(table, "bx--data-table--compact", /*size*/ ctx[0] === "compact");
    			toggle_class(table, "bx--data-table--short", /*size*/ ctx[0] === "short");
    			toggle_class(table, "bx--data-table--tall", /*size*/ ctx[0] === "tall");
    			toggle_class(table, "bx--data-table--sort", /*sortable*/ ctx[4]);
    			toggle_class(table, "bx--data-table--zebra", /*zebra*/ ctx[1]);
    			toggle_class(table, "bx--data-table--static", /*useStaticWidth*/ ctx[2]);
    			toggle_class(table, "bx--data-table--no-border", !/*shouldShowBorder*/ ctx[3]);
    			toggle_class(table, "bx--data-table--sticky-header", /*stickyHeader*/ ctx[5]);
    			add_location(table, file$g, 55, 2, 1422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			set_attributes(table, table_data = get_spread_update(table_levels, [dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]]));
    			toggle_class(table, "bx--data-table", true);
    			toggle_class(table, "bx--data-table--compact", /*size*/ ctx[0] === "compact");
    			toggle_class(table, "bx--data-table--short", /*size*/ ctx[0] === "short");
    			toggle_class(table, "bx--data-table--tall", /*size*/ ctx[0] === "tall");
    			toggle_class(table, "bx--data-table--sort", /*sortable*/ ctx[4]);
    			toggle_class(table, "bx--data-table--zebra", /*zebra*/ ctx[1]);
    			toggle_class(table, "bx--data-table--static", /*useStaticWidth*/ ctx[2]);
    			toggle_class(table, "bx--data-table--no-border", !/*shouldShowBorder*/ ctx[3]);
    			toggle_class(table, "bx--data-table--sticky-header", /*stickyHeader*/ ctx[5]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(55:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:0) {#if stickyHeader}
    function create_if_block$5(ctx) {
    	let section;
    	let table;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let section_levels = [/*$$restProps*/ ctx[6]];
    	let section_data = {};

    	for (let i = 0; i < section_levels.length; i += 1) {
    		section_data = assign(section_data, section_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			toggle_class(table, "bx--data-table", true);
    			toggle_class(table, "bx--data-table--compact", /*size*/ ctx[0] === "compact");
    			toggle_class(table, "bx--data-table--short", /*size*/ ctx[0] === "short");
    			toggle_class(table, "bx--data-table--tall", /*size*/ ctx[0] === "tall");
    			toggle_class(table, "bx--data-table--sort", /*sortable*/ ctx[4]);
    			toggle_class(table, "bx--data-table--zebra", /*zebra*/ ctx[1]);
    			toggle_class(table, "bx--data-table--static", /*useStaticWidth*/ ctx[2]);
    			toggle_class(table, "bx--data-table--no-border", !/*shouldShowBorder*/ ctx[3]);
    			toggle_class(table, "bx--data-table--sticky-header", /*stickyHeader*/ ctx[5]);
    			add_location(table, file$g, 40, 4, 892);
    			set_attributes(section, section_data);
    			toggle_class(section, "bx--data-table_inner-container", true);
    			add_location(section, file$g, 39, 2, 815);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (dirty & /*size*/ 1) {
    				toggle_class(table, "bx--data-table--compact", /*size*/ ctx[0] === "compact");
    			}

    			if (dirty & /*size*/ 1) {
    				toggle_class(table, "bx--data-table--short", /*size*/ ctx[0] === "short");
    			}

    			if (dirty & /*size*/ 1) {
    				toggle_class(table, "bx--data-table--tall", /*size*/ ctx[0] === "tall");
    			}

    			if (dirty & /*sortable*/ 16) {
    				toggle_class(table, "bx--data-table--sort", /*sortable*/ ctx[4]);
    			}

    			if (dirty & /*zebra*/ 2) {
    				toggle_class(table, "bx--data-table--zebra", /*zebra*/ ctx[1]);
    			}

    			if (dirty & /*useStaticWidth*/ 4) {
    				toggle_class(table, "bx--data-table--static", /*useStaticWidth*/ ctx[2]);
    			}

    			if (dirty & /*shouldShowBorder*/ 8) {
    				toggle_class(table, "bx--data-table--no-border", !/*shouldShowBorder*/ ctx[3]);
    			}

    			if (dirty & /*stickyHeader*/ 32) {
    				toggle_class(table, "bx--data-table--sticky-header", /*stickyHeader*/ ctx[5]);
    			}

    			set_attributes(section, section_data = get_spread_update(section_levels, [dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]]));
    			toggle_class(section, "bx--data-table_inner-container", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(39:0) {#if stickyHeader}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*stickyHeader*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const omit_props_names = ["size","zebra","useStaticWidth","shouldShowBorder","sortable","stickyHeader"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, ['default']);
    	let { size = undefined } = $$props;
    	let { zebra = false } = $$props;
    	let { useStaticWidth = false } = $$props;
    	let { shouldShowBorder = false } = $$props;
    	let { sortable = false } = $$props;
    	let { stickyHeader = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("zebra" in $$new_props) $$invalidate(1, zebra = $$new_props.zebra);
    		if ("useStaticWidth" in $$new_props) $$invalidate(2, useStaticWidth = $$new_props.useStaticWidth);
    		if ("shouldShowBorder" in $$new_props) $$invalidate(3, shouldShowBorder = $$new_props.shouldShowBorder);
    		if ("sortable" in $$new_props) $$invalidate(4, sortable = $$new_props.sortable);
    		if ("stickyHeader" in $$new_props) $$invalidate(5, stickyHeader = $$new_props.stickyHeader);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		zebra,
    		useStaticWidth,
    		shouldShowBorder,
    		sortable,
    		stickyHeader
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("zebra" in $$props) $$invalidate(1, zebra = $$new_props.zebra);
    		if ("useStaticWidth" in $$props) $$invalidate(2, useStaticWidth = $$new_props.useStaticWidth);
    		if ("shouldShowBorder" in $$props) $$invalidate(3, shouldShowBorder = $$new_props.shouldShowBorder);
    		if ("sortable" in $$props) $$invalidate(4, sortable = $$new_props.sortable);
    		if ("stickyHeader" in $$props) $$invalidate(5, stickyHeader = $$new_props.stickyHeader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		zebra,
    		useStaticWidth,
    		shouldShowBorder,
    		sortable,
    		stickyHeader,
    		$$restProps,
    		$$scope,
    		slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			size: 0,
    			zebra: 1,
    			useStaticWidth: 2,
    			shouldShowBorder: 3,
    			sortable: 4,
    			stickyHeader: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get size() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zebra() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zebra(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useStaticWidth() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useStaticWidth(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldShowBorder() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldShowBorder(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortable() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortable(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stickyHeader() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stickyHeader(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableBody.svelte generated by Svelte v3.29.4 */

    const file$h = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableBody.svelte";

    function create_fragment$i(ctx) {
    	let tbody;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	let tbody_levels = [{ "aria-live": "polite" }, /*$$restProps*/ ctx[0]];
    	let tbody_data = {};

    	for (let i = 0; i < tbody_levels.length; i += 1) {
    		tbody_data = assign(tbody_data, tbody_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			if (default_slot) default_slot.c();
    			set_attributes(tbody, tbody_data);
    			add_location(tbody, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);

    			if (default_slot) {
    				default_slot.m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_attributes(tbody, tbody_data = get_spread_update(tbody_levels, [
    				{ "aria-live": "polite" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableBody", slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [$$restProps, $$scope, slots];
    }

    class TableBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableBody",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableCell.svelte generated by Svelte v3.29.4 */

    const file$i = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableCell.svelte";

    function create_fragment$j(ctx) {
    	let td;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	let td_levels = [/*$$restProps*/ ctx[0]];
    	let td_data = {};

    	for (let i = 0; i < td_levels.length; i += 1) {
    		td_data = assign(td_data, td_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if (default_slot) default_slot.c();
    			set_attributes(td, td_data);
    			add_location(td, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			if (default_slot) {
    				default_slot.m(td, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(td, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(td, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(td, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(td, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_attributes(td, td_data = get_spread_update(td_levels, [dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableCell", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class TableCell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableCell",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableContainer.svelte generated by Svelte v3.29.4 */

    const file$j = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableContainer.svelte";

    // (26:2) {#if title}
    function create_if_block$6(ctx) {
    	let div;
    	let h4;
    	let t0;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*description*/ ctx[1]);
    			toggle_class(h4, "bx--data-table-header__title", true);
    			add_location(h4, file$j, 27, 6, 578);
    			toggle_class(p, "bx--data-table-header__description", true);
    			add_location(p, file$j, 28, 6, 645);
    			toggle_class(div, "bx--data-table-header", true);
    			add_location(div, file$j, 26, 4, 529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*description*/ 2) set_data_dev(t2, /*description*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(26:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$6(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--data-table-container", true);
    			toggle_class(div, "bx--data-table--max-width", /*stickyHeader*/ ctx[2]);
    			add_location(div, file$j, 20, 0, 392);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(div, "bx--data-table-container", true);
    			toggle_class(div, "bx--data-table--max-width", /*stickyHeader*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	const omit_props_names = ["title","description","stickyHeader"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableContainer", slots, ['default']);
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { stickyHeader = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("title" in $$new_props) $$invalidate(0, title = $$new_props.title);
    		if ("description" in $$new_props) $$invalidate(1, description = $$new_props.description);
    		if ("stickyHeader" in $$new_props) $$invalidate(2, stickyHeader = $$new_props.stickyHeader);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, description, stickyHeader });

    	$$self.$inject_state = $$new_props => {
    		if ("title" in $$props) $$invalidate(0, title = $$new_props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$new_props.description);
    		if ("stickyHeader" in $$props) $$invalidate(2, stickyHeader = $$new_props.stickyHeader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description, stickyHeader, $$restProps, $$scope, slots];
    }

    class TableContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			title: 0,
    			description: 1,
    			stickyHeader: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableContainer",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get title() {
    		throw new Error("<TableContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TableContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<TableContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<TableContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stickyHeader() {
    		throw new Error("<TableContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stickyHeader(value) {
    		throw new Error("<TableContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableHead.svelte generated by Svelte v3.29.4 */

    const file$k = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableHead.svelte";

    function create_fragment$l(ctx) {
    	let thead;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	let thead_levels = [/*$$restProps*/ ctx[0]];
    	let thead_data = {};

    	for (let i = 0; i < thead_levels.length; i += 1) {
    		thead_data = assign(thead_data, thead_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			if (default_slot) default_slot.c();
    			set_attributes(thead, thead_data);
    			add_location(thead, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);

    			if (default_slot) {
    				default_slot.m(thead, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(thead, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(thead, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(thead, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(thead, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_attributes(thead, thead_data = get_spread_update(thead_levels, [dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableHead", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class TableHead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableHead",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* node_modules\carbon-icons-svelte\lib\ArrowUp20\ArrowUp20.svelte generated by Svelte v3.29.4 */

    const file$l = "node_modules\\carbon-icons-svelte\\lib\\ArrowUp20\\ArrowUp20.svelte";

    // (39:4) {#if title}
    function create_if_block$7(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$l, 39, 6, 1070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "ArrowUp20" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "20" },
    		{ height: "20" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M16 4L6 14 7.41 15.41 15 7.83 15 30 17 30 17 7.83 24.59 15.41 26 14 16 4z");
    			add_location(path, file$l, 36, 2, 947);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$l, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[11], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "ArrowUp20" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "20" },
    				{ height: "20" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArrowUp20", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(15, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(16, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(17, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(15, ariaLabel = $$props["aria-label"]);
    		 $$invalidate(16, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 98308) {
    			 $$invalidate(17, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 229472) {
    			 $$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class ArrowUp20 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowUp20",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get class() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ArrowUp20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ArrowUp20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-icons-svelte\lib\ArrowsVertical20\ArrowsVertical20.svelte generated by Svelte v3.29.4 */

    const file$m = "node_modules\\carbon-icons-svelte\\lib\\ArrowsVertical20\\ArrowsVertical20.svelte";

    // (39:4) {#if title}
    function create_if_block$8(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$m, 39, 6, 1128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "ArrowsVertical20" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ width: "20" },
    		{ height: "20" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M27.6 20.6L24 24.2 24 4 22 4 22 24.2 18.4 20.6 17 22 23 28 29 22zM9 4L3 10 4.4 11.4 8 7.8 8 28 10 28 10 7.8 13.6 11.4 15 10z");
    			add_location(path, file$m, 36, 2, 954);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$m, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[11], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "ArrowsVertical20" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ width: "20" },
    				{ height: "20" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArrowsVertical20", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(15, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(16, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(17, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(15, ariaLabel = $$props["aria-label"]);
    		 $$invalidate(16, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 98308) {
    			 $$invalidate(17, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 229472) {
    			 $$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class ArrowsVertical20 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowsVertical20",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get class() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ArrowsVertical20>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ArrowsVertical20>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableHeader.svelte generated by Svelte v3.29.4 */
    const file$n = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableHeader.svelte";

    // (59:0) {:else}
    function create_else_block$2(ctx) {
    	let th;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let th_levels = [{ scope: /*scope*/ ctx[0] }, { id: /*id*/ ctx[1] }, /*$$restProps*/ ctx[8]];
    	let th_data = {};

    	for (let i = 0; i < th_levels.length; i += 1) {
    		th_data = assign(th_data, th_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			toggle_class(div, "bx--table-header-label", true);
    			add_location(div, file$n, 68, 4, 1618);
    			set_attributes(th, th_data);
    			add_location(th, file$n, 59, 2, 1485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(th, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(th, "mouseover", /*mouseover_handler_1*/ ctx[17], false, false, false),
    					listen_dev(th, "mouseenter", /*mouseenter_handler_1*/ ctx[18], false, false, false),
    					listen_dev(th, "mouseleave", /*mouseleave_handler_1*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(th, th_data = get_spread_update(th_levels, [
    				(!current || dirty & /*scope*/ 1) && { scope: /*scope*/ ctx[0] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(59:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:0) {#if $tableSortable}
    function create_if_block$9(ctx) {
    	let th;
    	let button;
    	let div;
    	let t0;
    	let arrowup20;
    	let t1;
    	let arrowsvertical20;
    	let th_aria_sort_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	arrowup20 = new ArrowUp20({
    			props: {
    				"aria-label": /*ariaLabel*/ ctx[4],
    				class: "bx--table-sort__icon"
    			},
    			$$inline: true
    		});

    	arrowsvertical20 = new ArrowsVertical20({
    			props: {
    				"aria-label": /*ariaLabel*/ ctx[4],
    				class: "bx--table-sort__icon-unsorted"
    			},
    			$$inline: true
    		});

    	let th_levels = [
    		{
    			"aria-sort": th_aria_sort_value = /*active*/ ctx[2]
    			? /*$sortHeader*/ ctx[3].sortDirection
    			: "none"
    		},
    		{ scope: /*scope*/ ctx[0] },
    		{ id: /*id*/ ctx[1] },
    		/*$$restProps*/ ctx[8]
    	];

    	let th_data = {};

    	for (let i = 0; i < th_levels.length; i += 1) {
    		th_data = assign(th_data, th_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			button = element("button");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			create_component(arrowup20.$$.fragment);
    			t1 = space();
    			create_component(arrowsvertical20.$$.fragment);
    			toggle_class(div, "bx--table-header-label", true);
    			add_location(div, file$n, 48, 6, 1193);
    			toggle_class(button, "bx--table-sort", true);
    			toggle_class(button, "bx--table-sort--active", /*active*/ ctx[2]);
    			toggle_class(button, "bx--table-sort--ascending", /*active*/ ctx[2] && /*$sortHeader*/ ctx[3].sortDirection === "descending");
    			add_location(button, file$n, 42, 4, 981);
    			set_attributes(th, th_data);
    			add_location(th, file$n, 33, 2, 799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, button);
    			append_dev(button, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(button, t0);
    			mount_component(arrowup20, button, null);
    			append_dev(button, t1);
    			mount_component(arrowsvertical20, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(th, "mouseover", /*mouseover_handler*/ ctx[12], false, false, false),
    					listen_dev(th, "mouseenter", /*mouseenter_handler*/ ctx[13], false, false, false),
    					listen_dev(th, "mouseleave", /*mouseleave_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			const arrowup20_changes = {};
    			if (dirty & /*ariaLabel*/ 16) arrowup20_changes["aria-label"] = /*ariaLabel*/ ctx[4];
    			arrowup20.$set(arrowup20_changes);
    			const arrowsvertical20_changes = {};
    			if (dirty & /*ariaLabel*/ 16) arrowsvertical20_changes["aria-label"] = /*ariaLabel*/ ctx[4];
    			arrowsvertical20.$set(arrowsvertical20_changes);

    			if (dirty & /*active*/ 4) {
    				toggle_class(button, "bx--table-sort--active", /*active*/ ctx[2]);
    			}

    			if (dirty & /*active, $sortHeader*/ 12) {
    				toggle_class(button, "bx--table-sort--ascending", /*active*/ ctx[2] && /*$sortHeader*/ ctx[3].sortDirection === "descending");
    			}

    			set_attributes(th, th_data = get_spread_update(th_levels, [
    				(!current || dirty & /*active, $sortHeader*/ 12 && th_aria_sort_value !== (th_aria_sort_value = /*active*/ ctx[2]
    				? /*$sortHeader*/ ctx[3].sortDirection
    				: "none")) && { "aria-sort": th_aria_sort_value },
    				(!current || dirty & /*scope*/ 1) && { scope: /*scope*/ ctx[0] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(arrowup20.$$.fragment, local);
    			transition_in(arrowsvertical20.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(arrowup20.$$.fragment, local);
    			transition_out(arrowsvertical20.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(arrowup20);
    			destroy_component(arrowsvertical20);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(33:0) {#if $tableSortable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$9, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$tableSortable*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	const omit_props_names = ["scope","translateWithId","id"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $sortHeader;
    	let $tableSortable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableHeader", slots, ['default']);
    	let { scope = "col" } = $$props;
    	let { translateWithId = () => "" } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	const { sortHeader, tableSortable, add } = getContext("DataTable");
    	validate_store(sortHeader, "sortHeader");
    	component_subscribe($$self, sortHeader, value => $$invalidate(3, $sortHeader = value));
    	validate_store(tableSortable, "tableSortable");
    	component_subscribe($$self, tableSortable, value => $$invalidate(5, $tableSortable = value));
    	add(id);

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("scope" in $$new_props) $$invalidate(0, scope = $$new_props.scope);
    		if ("translateWithId" in $$new_props) $$invalidate(9, translateWithId = $$new_props.translateWithId);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scope,
    		translateWithId,
    		id,
    		getContext,
    		ArrowUp20,
    		ArrowsVertical20,
    		sortHeader,
    		tableSortable,
    		add,
    		active,
    		$sortHeader,
    		ariaLabel,
    		$tableSortable
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("scope" in $$props) $$invalidate(0, scope = $$new_props.scope);
    		if ("translateWithId" in $$props) $$invalidate(9, translateWithId = $$new_props.translateWithId);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("active" in $$props) $$invalidate(2, active = $$new_props.active);
    		if ("ariaLabel" in $$props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
    	};

    	let active;
    	let ariaLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sortHeader, id*/ 10) {
    			 $$invalidate(2, active = $sortHeader.id === id);
    		}

    		if ($$self.$$.dirty & /*translateWithId*/ 512) {
    			// TODO: translate with id
    			 $$invalidate(4, ariaLabel = translateWithId());
    		}
    	};

    	return [
    		scope,
    		id,
    		active,
    		$sortHeader,
    		ariaLabel,
    		$tableSortable,
    		sortHeader,
    		tableSortable,
    		$$restProps,
    		translateWithId,
    		$$scope,
    		slots,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		click_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class TableHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { scope: 0, translateWithId: 9, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableHeader",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get scope() {
    		throw new Error("<TableHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scope(value) {
    		throw new Error("<TableHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateWithId() {
    		throw new Error("<TableHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateWithId(value) {
    		throw new Error("<TableHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TableHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TableHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\TableRow.svelte generated by Svelte v3.29.4 */

    const file$o = "node_modules\\carbon-components-svelte\\src\\DataTable\\TableRow.svelte";

    function create_fragment$p(ctx) {
    	let tr;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	let tr_levels = [/*$$restProps*/ ctx[0]];
    	let tr_data = {};

    	for (let i = 0; i < tr_levels.length; i += 1) {
    		tr_data = assign(tr_data, tr_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (default_slot) default_slot.c();
    			set_attributes(tr, tr_data);
    			add_location(tr, file$o, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			if (default_slot) {
    				default_slot.m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(tr, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(tr, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(tr, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(tr, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_attributes(tr, tr_data = get_spread_update(tr_levels, [dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableRow", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class TableRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableRow",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* node_modules\carbon-components-svelte\src\DataTable\DataTable.svelte generated by Svelte v3.29.4 */
    const file$p = "node_modules\\carbon-components-svelte\\src\\DataTable\\DataTable.svelte";

    const get_expanded_row_slot_changes = dirty => ({
    	row: dirty[0] & /*sorting, sortedRows, rows*/ 10485761
    });

    const get_expanded_row_slot_context = ctx => ({ row: /*row*/ ctx[52] });

    const get_cell_slot_changes_1 = dirty => ({
    	row: dirty[0] & /*sorting, sortedRows, rows*/ 10485761,
    	cell: dirty[0] & /*sorting, sortedRows, rows*/ 10485761
    });

    const get_cell_slot_context_1 = ctx => ({
    	row: /*row*/ ctx[52],
    	cell: /*cell*/ ctx[55]
    });

    const get_cell_slot_changes = dirty => ({
    	row: dirty[0] & /*sorting, sortedRows, rows*/ 10485761,
    	cell: dirty[0] & /*sorting, sortedRows, rows*/ 10485761
    });

    const get_cell_slot_context = ctx => ({
    	row: /*row*/ ctx[52],
    	cell: /*cell*/ ctx[55]
    });

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	child_ctx[57] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	child_ctx[54] = i;
    	return child_ctx;
    }

    const get_cell_header_slot_changes = dirty => ({ header: dirty[0] & /*headers*/ 32 });
    const get_cell_header_slot_context = ctx => ({ header: /*header*/ ctx[58] });

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[58] = list[i];
    	child_ctx[54] = i;
    	return child_ctx;
    }

    // (200:8) {#if expandable}
    function create_if_block_8(ctx) {
    	let th;
    	let th_data_previous_value_value;
    	let current;
    	let if_block = /*batchExpansion*/ ctx[11] && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "data-previous-value", th_data_previous_value_value = /*expanded*/ ctx[15] ? "collapsed" : undefined);
    			toggle_class(th, "bx--table-expand", true);
    			add_location(th, file$p, 200, 10, 5349);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			if (if_block) if_block.m(th, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*batchExpansion*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*batchExpansion*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(th, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*expanded*/ 32768 && th_data_previous_value_value !== (th_data_previous_value_value = /*expanded*/ ctx[15] ? "collapsed" : undefined)) {
    				attr_dev(th, "data-previous-value", th_data_previous_value_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(200:8) {#if expandable}",
    		ctx
    	});

    	return block;
    }

    // (206:12) {#if batchExpansion}
    function create_if_block_9(ctx) {
    	let button;
    	let chevronright16;
    	let current;
    	let mounted;
    	let dispose;

    	chevronright16 = new ChevronRight16({
    			props: { class: "bx--table-expand__svg" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(chevronright16.$$.fragment);
    			attr_dev(button, "type", "button");
    			toggle_class(button, "bx--table-expand__button", true);
    			add_location(button, file$p, 206, 14, 5551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(chevronright16, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chevronright16.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chevronright16.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(chevronright16);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(206:12) {#if batchExpansion}",
    		ctx
    	});

    	return block;
    }

    // (222:8) {#if selectable && !batchSelection}
    function create_if_block_7(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "scope", "col");
    			add_location(th, file$p, 222, 10, 6092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(222:8) {#if selectable && !batchSelection}",
    		ctx
    	});

    	return block;
    }

    // (225:8) {#if batchSelection && !radio}
    function create_if_block_6(ctx) {
    	let th;
    	let inlinecheckbox;
    	let updating_ref;
    	let current;

    	function inlinecheckbox_ref_binding(value) {
    		/*inlinecheckbox_ref_binding*/ ctx[33].call(null, value);
    	}

    	let inlinecheckbox_props = {
    		"aria-label": "Select all rows",
    		checked: /*selectAll*/ ctx[17],
    		indeterminate: /*indeterminate*/ ctx[20]
    	};

    	if (/*refSelectAll*/ ctx[18] !== void 0) {
    		inlinecheckbox_props.ref = /*refSelectAll*/ ctx[18];
    	}

    	inlinecheckbox = new InlineCheckbox({
    			props: inlinecheckbox_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(inlinecheckbox, "ref", inlinecheckbox_ref_binding));
    	inlinecheckbox.$on("change", /*change_handler*/ ctx[34]);

    	const block = {
    		c: function create() {
    			th = element("th");
    			create_component(inlinecheckbox.$$.fragment);
    			attr_dev(th, "scope", "col");
    			toggle_class(th, "bx--table-column-checkbox", true);
    			add_location(th, file$p, 225, 10, 6177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			mount_component(inlinecheckbox, th, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inlinecheckbox_changes = {};
    			if (dirty[0] & /*selectAll*/ 131072) inlinecheckbox_changes.checked = /*selectAll*/ ctx[17];
    			if (dirty[0] & /*indeterminate*/ 1048576) inlinecheckbox_changes.indeterminate = /*indeterminate*/ ctx[20];

    			if (!updating_ref && dirty[0] & /*refSelectAll*/ 262144) {
    				updating_ref = true;
    				inlinecheckbox_changes.ref = /*refSelectAll*/ ctx[18];
    				add_flush_callback(() => updating_ref = false);
    			}

    			inlinecheckbox.$set(inlinecheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inlinecheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inlinecheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			destroy_component(inlinecheckbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(225:8) {#if batchSelection && !radio}",
    		ctx
    	});

    	return block;
    }

    // (252:10) {:else}
    function create_else_block_2(ctx) {
    	let tableheader;
    	let current;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[35](/*header*/ ctx[58], ...args);
    	}

    	tableheader = new TableHeader({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tableheader.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			create_component(tableheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableheader, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tableheader_changes = {};

    			if (dirty[0] & /*headers*/ 32 | dirty[1] & /*$$scope*/ 16384) {
    				tableheader_changes.$$scope = { dirty, ctx };
    			}

    			tableheader.$set(tableheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(252:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (250:10) {#if header.empty}
    function create_if_block_5(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "scope", "col");
    			add_location(th, file$p, 250, 12, 7003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(250:10) {#if header.empty}",
    		ctx
    	});

    	return block;
    }

    // (268:57) {header.value}
    function fallback_block_2(ctx) {
    	let t_value = /*header*/ ctx[58].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headers*/ 32 && t_value !== (t_value = /*header*/ ctx[58].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(268:57) {header.value}",
    		ctx
    	});

    	return block;
    }

    // (253:12) <TableHeader               on:click="{() => {                 dispatch('click', { header });                 let active = header.key === $sortHeader.key;                 let currentSortDirection = active ? $sortHeader.sortDirection : 'none';                 let sortDirection = sortDirectionMap[currentSortDirection];                 dispatch('click:header', { header, sortDirection });                 sortHeader.set({                   id: sortDirection === 'none' ? null : $thKeys[header.key],                   key: header.key,                   sort: header.sort,                   sortDirection,                 });               }}"             >
    function create_default_slot_9(ctx) {
    	let t;
    	let current;
    	const cell_header_slot_template = /*#slots*/ ctx[31]["cell-header"];
    	const cell_header_slot = create_slot(cell_header_slot_template, ctx, /*$$scope*/ ctx[45], get_cell_header_slot_context);
    	const cell_header_slot_or_fallback = cell_header_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (cell_header_slot_or_fallback) cell_header_slot_or_fallback.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (cell_header_slot_or_fallback) {
    				cell_header_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (cell_header_slot) {
    				if (cell_header_slot.p && dirty[0] & /*headers*/ 32 | dirty[1] & /*$$scope*/ 16384) {
    					update_slot(cell_header_slot, cell_header_slot_template, ctx, /*$$scope*/ ctx[45], dirty, get_cell_header_slot_changes, get_cell_header_slot_context);
    				}
    			} else {
    				if (cell_header_slot_or_fallback && cell_header_slot_or_fallback.p && dirty[0] & /*headers*/ 32) {
    					cell_header_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell_header_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell_header_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (cell_header_slot_or_fallback) cell_header_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(253:12) <TableHeader               on:click=\\\"{() => {                 dispatch('click', { header });                 let active = header.key === $sortHeader.key;                 let currentSortDirection = active ? $sortHeader.sortDirection : 'none';                 let sortDirection = sortDirectionMap[currentSortDirection];                 dispatch('click:header', { header, sortDirection });                 sortHeader.set({                   id: sortDirection === 'none' ? null : $thKeys[header.key],                   key: header.key,                   sort: header.sort,                   sortDirection,                 });               }}\\\"             >",
    		ctx
    	});

    	return block;
    }

    // (249:8) {#each headers as header, i (header.key)}
    function create_each_block_2(key_1, ctx) {
    	let first;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*header*/ ctx[58].empty) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(249:8) {#each headers as header, i (header.key)}",
    		ctx
    	});

    	return block;
    }

    // (199:6) <TableRow>
    function create_default_slot_8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let if_block0 = /*expandable*/ ctx[1] && create_if_block_8(ctx);
    	let if_block1 = /*selectable*/ ctx[3] && !/*batchSelection*/ ctx[13] && create_if_block_7(ctx);
    	let if_block2 = /*batchSelection*/ ctx[13] && !/*radio*/ ctx[12] && create_if_block_6(ctx);
    	let each_value_2 = /*headers*/ ctx[5];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*header*/ ctx[58].key;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*expandable*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*expandable*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*selectable*/ ctx[3] && !/*batchSelection*/ ctx[13]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*batchSelection*/ ctx[13] && !/*radio*/ ctx[12]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*batchSelection, radio*/ 12288) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*headers, dispatch, $sortHeader, sortDirectionMap, sortHeader, $thKeys*/ 255852576 | dirty[1] & /*$$scope*/ 16384) {
    				const each_value_2 = /*headers*/ ctx[5];
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_2, each_1_anchor, get_each_context_2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(199:6) <TableRow>",
    		ctx
    	});

    	return block;
    }

    // (198:4) <TableHead>
    function create_default_slot_7(ctx) {
    	let tablerow;
    	let current;

    	tablerow = new TableRow({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablerow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablerow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablerow_changes = {};

    			if (dirty[0] & /*headers, $sortHeader, $thKeys, selectAll, indeterminate, refSelectAll, selectedRowIds, rows, batchSelection, radio, selectable, expanded, expandedRowIds, batchExpansion, expandable*/ 22460479 | dirty[1] & /*$$scope*/ 16384) {
    				tablerow_changes.$$scope = { dirty, ctx };
    			}

    			tablerow.$set(tablerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablerow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(198:4) <TableHead>",
    		ctx
    	});

    	return block;
    }

    // (290:10) {#if expandable}
    function create_if_block_4(ctx) {
    	let tablecell;
    	let current;

    	tablecell = new TableCell({
    			props: {
    				class: "bx--table-expand",
    				headers: "expand",
    				"data-previous-value": /*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    				? "collapsed"
    				: undefined,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablecell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablecell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablecell_changes = {};

    			if (dirty[0] & /*expandedRows, sorting, sortedRows, rows*/ 11010049) tablecell_changes["data-previous-value"] = /*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    			? "collapsed"
    			: undefined;

    			if (dirty[0] & /*expandedRows, sorting, sortedRows, rows, expandedRowIds*/ 11010053 | dirty[1] & /*$$scope*/ 16384) {
    				tablecell_changes.$$scope = { dirty, ctx };
    			}

    			tablecell.$set(tablecell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablecell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablecell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablecell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(290:10) {#if expandable}",
    		ctx
    	});

    	return block;
    }

    // (291:12) <TableCell               class="bx--table-expand"               headers="expand"               data-previous-value="{expandedRows[row.id] ? 'collapsed' : undefined}"             >
    function create_default_slot_6(ctx) {
    	let button;
    	let chevronright16;
    	let button_aria_label_value;
    	let current;
    	let mounted;
    	let dispose;

    	chevronright16 = new ChevronRight16({
    			props: { class: "bx--table-expand__svg" },
    			$$inline: true
    		});

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[36](/*row*/ ctx[52], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(chevronright16.$$.fragment);
    			attr_dev(button, "type", "button");

    			attr_dev(button, "aria-label", button_aria_label_value = /*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    			? "Collapse current row"
    			: "Expand current row");

    			toggle_class(button, "bx--table-expand__button", true);
    			add_location(button, file$p, 295, 14, 8805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(chevronright16, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*expandedRows, sorting, sortedRows, rows*/ 11010049 && button_aria_label_value !== (button_aria_label_value = /*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    			? "Collapse current row"
    			: "Expand current row")) {
    				attr_dev(button, "aria-label", button_aria_label_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chevronright16.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chevronright16.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(chevronright16);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(291:12) <TableCell               class=\\\"bx--table-expand\\\"               headers=\\\"expand\\\"               data-previous-value=\\\"{expandedRows[row.id] ? 'collapsed' : undefined}\\\"             >",
    		ctx
    	});

    	return block;
    }

    // (315:10) {#if selectable}
    function create_if_block_2(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*radio*/ ctx[12]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			toggle_class(td, "bx--table-column-checkbox", true);
    			toggle_class(td, "bx--table-column-radio", /*radio*/ ctx[12]);
    			add_location(td, file$p, 315, 12, 9569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, null);
    			}

    			if (dirty[0] & /*radio*/ 4096) {
    				toggle_class(td, "bx--table-column-radio", /*radio*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(315:10) {#if selectable}",
    		ctx
    	});

    	return block;
    }

    // (328:14) {:else}
    function create_else_block_1(ctx) {
    	let inlinecheckbox;
    	let current;

    	function change_handler_2(...args) {
    		return /*change_handler_2*/ ctx[38](/*row*/ ctx[52], ...args);
    	}

    	inlinecheckbox = new InlineCheckbox({
    			props: {
    				name: "select-row-" + /*row*/ ctx[52].id,
    				checked: /*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id)
    			},
    			$$inline: true
    		});

    	inlinecheckbox.$on("change", change_handler_2);

    	const block = {
    		c: function create() {
    			create_component(inlinecheckbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inlinecheckbox, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inlinecheckbox_changes = {};
    			if (dirty[0] & /*sorting, sortedRows, rows*/ 10485761) inlinecheckbox_changes.name = "select-row-" + /*row*/ ctx[52].id;
    			if (dirty[0] & /*selectedRowIds, sorting, sortedRows, rows*/ 10485777) inlinecheckbox_changes.checked = /*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id);
    			inlinecheckbox.$set(inlinecheckbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inlinecheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inlinecheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inlinecheckbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(328:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (320:14) {#if radio}
    function create_if_block_3(ctx) {
    	let radiobutton;
    	let current;

    	function change_handler_1(...args) {
    		return /*change_handler_1*/ ctx[37](/*row*/ ctx[52], ...args);
    	}

    	radiobutton = new RadioButton({
    			props: {
    				name: "select-row-" + /*row*/ ctx[52].id,
    				checked: /*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id)
    			},
    			$$inline: true
    		});

    	radiobutton.$on("change", change_handler_1);

    	const block = {
    		c: function create() {
    			create_component(radiobutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const radiobutton_changes = {};
    			if (dirty[0] & /*sorting, sortedRows, rows*/ 10485761) radiobutton_changes.name = "select-row-" + /*row*/ ctx[52].id;
    			if (dirty[0] & /*selectedRowIds, sorting, sortedRows, rows*/ 10485777) radiobutton_changes.checked = /*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id);
    			radiobutton.$set(radiobutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(320:14) {#if radio}",
    		ctx
    	});

    	return block;
    }

    // (350:12) {:else}
    function create_else_block$3(ctx) {
    	let tablecell;
    	let current;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[39](/*row*/ ctx[52], /*cell*/ ctx[55], ...args);
    	}

    	tablecell = new TableCell({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tablecell.$on("click", click_handler_3);

    	const block = {
    		c: function create() {
    			create_component(tablecell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablecell, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tablecell_changes = {};

    			if (dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793 | dirty[1] & /*$$scope*/ 16384) {
    				tablecell_changes.$$scope = { dirty, ctx };
    			}

    			tablecell.$set(tablecell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablecell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablecell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablecell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(350:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (344:12) {#if headers[j].empty}
    function create_if_block_1(ctx) {
    	let td;
    	let t;
    	let current;
    	const cell_slot_template = /*#slots*/ ctx[31].cell;
    	const cell_slot = create_slot(cell_slot_template, ctx, /*$$scope*/ ctx[45], get_cell_slot_context);
    	const cell_slot_or_fallback = cell_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if (cell_slot_or_fallback) cell_slot_or_fallback.c();
    			t = space();
    			toggle_class(td, "bx--table-column-menu", /*headers*/ ctx[5][/*j*/ ctx[57]].columnMenu);
    			add_location(td, file$p, 344, 14, 10639);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			if (cell_slot_or_fallback) {
    				cell_slot_or_fallback.m(td, null);
    			}

    			append_dev(td, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (cell_slot) {
    				if (cell_slot.p && dirty[0] & /*sorting, sortedRows, rows*/ 10485761 | dirty[1] & /*$$scope*/ 16384) {
    					update_slot(cell_slot, cell_slot_template, ctx, /*$$scope*/ ctx[45], dirty, get_cell_slot_changes, get_cell_slot_context);
    				}
    			} else {
    				if (cell_slot_or_fallback && cell_slot_or_fallback.p && dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793) {
    					cell_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793) {
    				toggle_class(td, "bx--table-column-menu", /*headers*/ ctx[5][/*j*/ ctx[57]].columnMenu);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if (cell_slot_or_fallback) cell_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(344:12) {#if headers[j].empty}",
    		ctx
    	});

    	return block;
    }

    // (357:60)                    
    function fallback_block_1(ctx) {
    	let t_value = (/*headers*/ ctx[5][/*j*/ ctx[57]].display
    	? /*headers*/ ctx[5][/*j*/ ctx[57]].display(/*cell*/ ctx[55].value)
    	: /*cell*/ ctx[55].value) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793 && t_value !== (t_value = (/*headers*/ ctx[5][/*j*/ ctx[57]].display
    			? /*headers*/ ctx[5][/*j*/ ctx[57]].display(/*cell*/ ctx[55].value)
    			: /*cell*/ ctx[55].value) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(357:60)                    ",
    		ctx
    	});

    	return block;
    }

    // (351:14) <TableCell                 on:click="{() => {                   dispatch('click', { row, cell });                   dispatch('click:cell', cell);                 }}"               >
    function create_default_slot_5(ctx) {
    	let t;
    	let current;
    	const cell_slot_template = /*#slots*/ ctx[31].cell;
    	const cell_slot = create_slot(cell_slot_template, ctx, /*$$scope*/ ctx[45], get_cell_slot_context_1);
    	const cell_slot_or_fallback = cell_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (cell_slot_or_fallback) cell_slot_or_fallback.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (cell_slot_or_fallback) {
    				cell_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (cell_slot) {
    				if (cell_slot.p && dirty[0] & /*sorting, sortedRows, rows*/ 10485761 | dirty[1] & /*$$scope*/ 16384) {
    					update_slot(cell_slot, cell_slot_template, ctx, /*$$scope*/ ctx[45], dirty, get_cell_slot_changes_1, get_cell_slot_context_1);
    				}
    			} else {
    				if (cell_slot_or_fallback && cell_slot_or_fallback.p && dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793) {
    					cell_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (cell_slot_or_fallback) cell_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(351:14) <TableCell                 on:click=\\\"{() => {                   dispatch('click', { row, cell });                   dispatch('click:cell', cell);                 }}\\\"               >",
    		ctx
    	});

    	return block;
    }

    // (346:60)                    
    function fallback_block$3(ctx) {
    	let t_value = (/*headers*/ ctx[5][/*j*/ ctx[57]].display
    	? /*headers*/ ctx[5][/*j*/ ctx[57]].display(/*cell*/ ctx[55].value)
    	: /*cell*/ ctx[55].value) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*headers, sorting, sortedRows, rows*/ 10485793 && t_value !== (t_value = (/*headers*/ ctx[5][/*j*/ ctx[57]].display
    			? /*headers*/ ctx[5][/*j*/ ctx[57]].display(/*cell*/ ctx[55].value)
    			: /*cell*/ ctx[55].value) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(346:60)                    ",
    		ctx
    	});

    	return block;
    }

    // (343:10) {#each row.cells as cell, j (cell.key)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*headers*/ ctx[5][/*j*/ ctx[57]].empty) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(343:10) {#each row.cells as cell, j (cell.key)}",
    		ctx
    	});

    	return block;
    }

    // (276:8) <TableRow           id="row-{row.id}"           class="{selectedRowIds.includes(row.id) ? 'bx--data-table--selected' : ''} {expandedRows[row.id] ? 'bx--expandable-row' : ''} {expandable ? 'bx--parent-row' : ''} {expandable && parentRowId === row.id ? 'bx--expandable-row--hover' : ''}"           on:click="{() => {             dispatch('click', { row });             dispatch('click:row', row);           }}"           on:mouseenter="{() => {             dispatch('mouseenter:row', row);           }}"           on:mouseleave="{() => {             dispatch('mouseleave:row', row);           }}"         >
    function create_default_slot_4(ctx) {
    	let t0;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let if_block0 = /*expandable*/ ctx[1] && create_if_block_4(ctx);
    	let if_block1 = /*selectable*/ ctx[3] && create_if_block_2(ctx);
    	let each_value_1 = /*row*/ ctx[52].cells;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*cell*/ ctx[55].key;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*expandable*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*expandable*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*selectable*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*selectable*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*headers, sorting, sortedRows, rows, dispatch*/ 77594657 | dirty[1] & /*$$scope*/ 16384) {
    				const each_value_1 = /*row*/ ctx[52].cells;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(276:8) <TableRow           id=\\\"row-{row.id}\\\"           class=\\\"{selectedRowIds.includes(row.id) ? 'bx--data-table--selected' : ''} {expandedRows[row.id] ? 'bx--expandable-row' : ''} {expandable ? 'bx--parent-row' : ''} {expandable && parentRowId === row.id ? 'bx--expandable-row--hover' : ''}\\\"           on:click=\\\"{() => {             dispatch('click', { row });             dispatch('click:row', row);           }}\\\"           on:mouseenter=\\\"{() => {             dispatch('mouseenter:row', row);           }}\\\"           on:mouseleave=\\\"{() => {             dispatch('mouseleave:row', row);           }}\\\"         >",
    		ctx
    	});

    	return block;
    }

    // (365:8) {#if expandable && expandedRows[row.id]}
    function create_if_block$a(ctx) {
    	let tr;
    	let tablecell;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	tablecell = new TableCell({
    			props: {
    				colspan: /*headers*/ ctx[5].length + 1,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function mouseenter_handler_1(...args) {
    		return /*mouseenter_handler_1*/ ctx[43](/*row*/ ctx[52], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			create_component(tablecell.$$.fragment);
    			t = space();
    			attr_dev(tr, "data-child-row", "");
    			toggle_class(tr, "bx--expandable-row", true);
    			add_location(tr, file$p, 365, 10, 11417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component(tablecell, tr, null);
    			append_dev(tr, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(tr, "mouseenter", mouseenter_handler_1, false, false, false),
    					listen_dev(tr, "mouseleave", /*mouseleave_handler_1*/ ctx[44], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tablecell_changes = {};
    			if (dirty[0] & /*headers*/ 32) tablecell_changes.colspan = /*headers*/ ctx[5].length + 1;

    			if (dirty[0] & /*sorting, sortedRows, rows*/ 10485761 | dirty[1] & /*$$scope*/ 16384) {
    				tablecell_changes.$$scope = { dirty, ctx };
    			}

    			tablecell.$set(tablecell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablecell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablecell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(tablecell);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(365:8) {#if expandable && expandedRows[row.id]}",
    		ctx
    	});

    	return block;
    }

    // (376:12) <TableCell colspan="{headers.length + 1}">
    function create_default_slot_3(ctx) {
    	let div;
    	let current;
    	const expanded_row_slot_template = /*#slots*/ ctx[31]["expanded-row"];
    	const expanded_row_slot = create_slot(expanded_row_slot_template, ctx, /*$$scope*/ ctx[45], get_expanded_row_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (expanded_row_slot) expanded_row_slot.c();
    			toggle_class(div, "bx--child-row-inner-container", true);
    			add_location(div, file$p, 376, 14, 11749);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (expanded_row_slot) {
    				expanded_row_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (expanded_row_slot) {
    				if (expanded_row_slot.p && dirty[0] & /*sorting, sortedRows, rows*/ 10485761 | dirty[1] & /*$$scope*/ 16384) {
    					update_slot(expanded_row_slot, expanded_row_slot_template, ctx, /*$$scope*/ ctx[45], dirty, get_expanded_row_slot_changes, get_expanded_row_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expanded_row_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expanded_row_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (expanded_row_slot) expanded_row_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(376:12) <TableCell colspan=\\\"{headers.length + 1}\\\">",
    		ctx
    	});

    	return block;
    }

    // (275:6) {#each sorting ? sortedRows : rows as row, i (row.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let tablerow;
    	let t;
    	let if_block_anchor;
    	let current;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[40](/*row*/ ctx[52], ...args);
    	}

    	function mouseenter_handler(...args) {
    		return /*mouseenter_handler*/ ctx[41](/*row*/ ctx[52], ...args);
    	}

    	function mouseleave_handler(...args) {
    		return /*mouseleave_handler*/ ctx[42](/*row*/ ctx[52], ...args);
    	}

    	tablerow = new TableRow({
    			props: {
    				id: "row-" + /*row*/ ctx[52].id,
    				class: "" + ((/*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id)
    				? "bx--data-table--selected"
    				: "") + " " + (/*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    				? "bx--expandable-row"
    				: "") + " " + (/*expandable*/ ctx[1] ? "bx--parent-row" : "") + " " + (/*expandable*/ ctx[1] && /*parentRowId*/ ctx[16] === /*row*/ ctx[52].id
    				? "bx--expandable-row--hover"
    				: "")),
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tablerow.$on("click", click_handler_4);
    	tablerow.$on("mouseenter", mouseenter_handler);
    	tablerow.$on("mouseleave", mouseleave_handler);
    	let if_block = /*expandable*/ ctx[1] && /*expandedRows*/ ctx[19][/*row*/ ctx[52].id] && create_if_block$a(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tablerow.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tablerow, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tablerow_changes = {};
    			if (dirty[0] & /*sorting, sortedRows, rows*/ 10485761) tablerow_changes.id = "row-" + /*row*/ ctx[52].id;

    			if (dirty[0] & /*selectedRowIds, sorting, sortedRows, rows, expandedRows, expandable, parentRowId*/ 11075603) tablerow_changes.class = "" + ((/*selectedRowIds*/ ctx[4].includes(/*row*/ ctx[52].id)
    			? "bx--data-table--selected"
    			: "") + " " + (/*expandedRows*/ ctx[19][/*row*/ ctx[52].id]
    			? "bx--expandable-row"
    			: "") + " " + (/*expandable*/ ctx[1] ? "bx--parent-row" : "") + " " + (/*expandable*/ ctx[1] && /*parentRowId*/ ctx[16] === /*row*/ ctx[52].id
    			? "bx--expandable-row--hover"
    			: ""));

    			if (dirty[0] & /*sorting, sortedRows, rows, headers, radio, selectedRowIds, selectable, expandedRows, expandedRowIds, expandable*/ 11014207 | dirty[1] & /*$$scope*/ 16384) {
    				tablerow_changes.$$scope = { dirty, ctx };
    			}

    			tablerow.$set(tablerow_changes);

    			if (/*expandable*/ ctx[1] && /*expandedRows*/ ctx[19][/*row*/ ctx[52].id]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*expandable, expandedRows, sorting, sortedRows, rows*/ 11010051) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablerow.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablerow.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tablerow, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(275:6) {#each sorting ? sortedRows : rows as row, i (row.id)}",
    		ctx
    	});

    	return block;
    }

    // (274:4) <TableBody>
    function create_default_slot_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;

    	let each_value = /*sorting*/ ctx[23]
    	? /*sortedRows*/ ctx[21]
    	: /*rows*/ ctx[0];

    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[52].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*parentRowId, sorting, sortedRows, rows, headers, expandable, expandedRows, selectedRowIds, dispatch, radio, selectable, expandedRowIds*/ 78188607 | dirty[1] & /*$$scope*/ 16384) {
    				const each_value = /*sorting*/ ctx[23]
    				? /*sortedRows*/ ctx[21]
    				: /*rows*/ ctx[0];

    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(274:4) <TableBody>",
    		ctx
    	});

    	return block;
    }

    // (192:2) <Table     zebra="{zebra}"     size="{size}"     stickyHeader="{stickyHeader}"     sortable="{sortable}"   >
    function create_default_slot_1(ctx) {
    	let tablehead;
    	let t;
    	let tablebody;
    	let current;

    	tablehead = new TableHead({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tablebody = new TableBody({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablehead.$$.fragment);
    			t = space();
    			create_component(tablebody.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablehead, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tablebody, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablehead_changes = {};

    			if (dirty[0] & /*headers, $sortHeader, $thKeys, selectAll, indeterminate, refSelectAll, selectedRowIds, rows, batchSelection, radio, selectable, expanded, expandedRowIds, batchExpansion, expandable*/ 22460479 | dirty[1] & /*$$scope*/ 16384) {
    				tablehead_changes.$$scope = { dirty, ctx };
    			}

    			tablehead.$set(tablehead_changes);
    			const tablebody_changes = {};

    			if (dirty[0] & /*sorting, sortedRows, rows, parentRowId, headers, expandable, expandedRows, selectedRowIds, radio, selectable, expandedRowIds*/ 11079743 | dirty[1] & /*$$scope*/ 16384) {
    				tablebody_changes.$$scope = { dirty, ctx };
    			}

    			tablebody.$set(tablebody_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablehead.$$.fragment, local);
    			transition_in(tablebody.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablehead.$$.fragment, local);
    			transition_out(tablebody.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablehead, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tablebody, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(192:2) <Table     zebra=\\\"{zebra}\\\"     size=\\\"{size}\\\"     stickyHeader=\\\"{stickyHeader}\\\"     sortable=\\\"{sortable}\\\"   >",
    		ctx
    	});

    	return block;
    }

    // (190:0) <TableContainer title="{title}" description="{description}" {...$$restProps}>
    function create_default_slot$6(ctx) {
    	let t;
    	let table;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[31].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[45], null);

    	table = new Table({
    			props: {
    				zebra: /*zebra*/ ctx[9],
    				size: /*size*/ ctx[6],
    				stickyHeader: /*stickyHeader*/ ctx[14],
    				sortable: /*sortable*/ ctx[10],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[45], dirty, null, null);
    				}
    			}

    			const table_changes = {};
    			if (dirty[0] & /*zebra*/ 512) table_changes.zebra = /*zebra*/ ctx[9];
    			if (dirty[0] & /*size*/ 64) table_changes.size = /*size*/ ctx[6];
    			if (dirty[0] & /*stickyHeader*/ 16384) table_changes.stickyHeader = /*stickyHeader*/ ctx[14];
    			if (dirty[0] & /*sortable*/ 1024) table_changes.sortable = /*sortable*/ ctx[10];

    			if (dirty[0] & /*sorting, sortedRows, rows, parentRowId, headers, expandable, expandedRows, selectedRowIds, radio, selectable, expandedRowIds, $sortHeader, $thKeys, selectAll, indeterminate, refSelectAll, batchSelection, expanded, batchExpansion*/ 33536063 | dirty[1] & /*$$scope*/ 16384) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(190:0) <TableContainer title=\\\"{title}\\\" description=\\\"{description}\\\" {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let tablecontainer;
    	let current;

    	const tablecontainer_spread_levels = [
    		{ title: /*title*/ ctx[7] },
    		{ description: /*description*/ ctx[8] },
    		/*$$restProps*/ ctx[30]
    	];

    	let tablecontainer_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tablecontainer_spread_levels.length; i += 1) {
    		tablecontainer_props = assign(tablecontainer_props, tablecontainer_spread_levels[i]);
    	}

    	tablecontainer = new TableContainer({
    			props: tablecontainer_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablecontainer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablecontainer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablecontainer_changes = (dirty[0] & /*title, description, $$restProps*/ 1073742208)
    			? get_spread_update(tablecontainer_spread_levels, [
    					dirty[0] & /*title*/ 128 && { title: /*title*/ ctx[7] },
    					dirty[0] & /*description*/ 256 && { description: /*description*/ ctx[8] },
    					dirty[0] & /*$$restProps*/ 1073741824 && get_spread_object(/*$$restProps*/ ctx[30])
    				])
    			: {};

    			if (dirty[0] & /*zebra, size, stickyHeader, sortable, sorting, sortedRows, rows, parentRowId, headers, expandable, expandedRows, selectedRowIds, radio, selectable, expandedRowIds, $sortHeader, $thKeys, selectAll, indeterminate, refSelectAll, batchSelection, expanded, batchExpansion*/ 33554047 | dirty[1] & /*$$scope*/ 16384) {
    				tablecontainer_changes.$$scope = { dirty, ctx };
    			}

    			tablecontainer.$set(tablecontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablecontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablecontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablecontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"headers","rows","size","title","description","zebra","sortable","expandable","batchExpansion","expandedRowIds","radio","selectable","batchSelection","selectedRowIds","stickyHeader"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $headerItems;
    	let $sortHeader;
    	let $thKeys;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DataTable", slots, ['default','cell-header','cell','expanded-row']);
    	let { headers = [] } = $$props;
    	let { rows = [] } = $$props;
    	let { size = undefined } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { zebra = false } = $$props;
    	let { sortable = false } = $$props;
    	let { expandable = false } = $$props;
    	let { batchExpansion = false } = $$props;
    	let { expandedRowIds = [] } = $$props;
    	let { radio = false } = $$props;
    	let { selectable = false } = $$props;
    	let { batchSelection = false } = $$props;
    	let { selectedRowIds = [] } = $$props;
    	let { stickyHeader = false } = $$props;

    	const sortDirectionMap = {
    		none: "ascending",
    		ascending: "descending",
    		descending: "none"
    	};

    	const dispatch = createEventDispatcher();
    	const batchSelectedIds = writable(false);
    	const tableSortable = writable(sortable);

    	const sortHeader = writable({
    		id: null,
    		key: null,
    		sort: undefined,
    		sortDirection: "none"
    	});

    	validate_store(sortHeader, "sortHeader");
    	component_subscribe($$self, sortHeader, value => $$invalidate(22, $sortHeader = value));
    	const headerItems = writable([]);
    	validate_store(headerItems, "headerItems");
    	component_subscribe($$self, headerItems, value => $$invalidate(46, $headerItems = value));
    	const thKeys = derived(headerItems, () => headers.map(({ key }, i) => ({ key, id: $headerItems[i] })).reduce((a, c) => ({ ...a, [c.key]: c.id }), {}));
    	validate_store(thKeys, "thKeys");
    	component_subscribe($$self, thKeys, value => $$invalidate(24, $thKeys = value));

    	setContext("DataTable", {
    		sortHeader,
    		tableSortable,
    		batchSelectedIds,
    		resetSelectedRowIds: () => {
    			$$invalidate(17, selectAll = false);
    			$$invalidate(4, selectedRowIds = []);
    			if (refSelectAll) $$invalidate(18, refSelectAll.checked = false, refSelectAll);
    		},
    		add: id => {
    			headerItems.update(_ => [..._, id]);
    		}
    	});

    	let expanded = false;
    	let parentRowId = null;
    	let selectAll = false;
    	let refSelectAll = null;

    	const click_handler = () => {
    		$$invalidate(15, expanded = !expanded);
    		$$invalidate(2, expandedRowIds = expanded ? rows.map(row => row.id) : []);
    		dispatch("click:header--expand", { expanded });
    	};

    	function inlinecheckbox_ref_binding(value) {
    		refSelectAll = value;
    		$$invalidate(18, refSelectAll);
    	}

    	const change_handler = e => {
    		if (indeterminate) {
    			e.target.checked = false;
    			$$invalidate(17, selectAll = false);
    			$$invalidate(4, selectedRowIds = []);
    			return;
    		}

    		if (e.target.checked) {
    			$$invalidate(4, selectedRowIds = rows.map(row => row.id));
    		} else {
    			$$invalidate(4, selectedRowIds = []);
    		}
    	};

    	const click_handler_1 = header => {
    		dispatch("click", { header });
    		let active = header.key === $sortHeader.key;
    		let currentSortDirection = active ? $sortHeader.sortDirection : "none";
    		let sortDirection = sortDirectionMap[currentSortDirection];
    		dispatch("click:header", { header, sortDirection });

    		sortHeader.set({
    			id: sortDirection === "none" ? null : $thKeys[header.key],
    			key: header.key,
    			sort: header.sort,
    			sortDirection
    		});
    	};

    	const click_handler_2 = row => {
    		const rowExpanded = !!expandedRows[row.id];

    		$$invalidate(2, expandedRowIds = rowExpanded
    		? expandedRowIds.filter(id => id !== row.id)
    		: [...expandedRowIds, row.id]);

    		dispatch("click:row--expand", { row, expanded: !rowExpanded });
    	};

    	const change_handler_1 = row => {
    		$$invalidate(4, selectedRowIds = [row.id]);
    	};

    	const change_handler_2 = row => {
    		if (selectedRowIds.includes(row.id)) {
    			$$invalidate(4, selectedRowIds = selectedRowIds.filter(id => id !== row.id));
    		} else {
    			$$invalidate(4, selectedRowIds = [...selectedRowIds, row.id]);
    		}
    	};

    	const click_handler_3 = (row, cell) => {
    		dispatch("click", { row, cell });
    		dispatch("click:cell", cell);
    	};

    	const click_handler_4 = row => {
    		dispatch("click", { row });
    		dispatch("click:row", row);
    	};

    	const mouseenter_handler = row => {
    		dispatch("mouseenter:row", row);
    	};

    	const mouseleave_handler = row => {
    		dispatch("mouseleave:row", row);
    	};

    	const mouseenter_handler_1 = row => {
    		$$invalidate(16, parentRowId = row.id);
    	};

    	const mouseleave_handler_1 = () => {
    		$$invalidate(16, parentRowId = null);
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(30, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("headers" in $$new_props) $$invalidate(5, headers = $$new_props.headers);
    		if ("rows" in $$new_props) $$invalidate(0, rows = $$new_props.rows);
    		if ("size" in $$new_props) $$invalidate(6, size = $$new_props.size);
    		if ("title" in $$new_props) $$invalidate(7, title = $$new_props.title);
    		if ("description" in $$new_props) $$invalidate(8, description = $$new_props.description);
    		if ("zebra" in $$new_props) $$invalidate(9, zebra = $$new_props.zebra);
    		if ("sortable" in $$new_props) $$invalidate(10, sortable = $$new_props.sortable);
    		if ("expandable" in $$new_props) $$invalidate(1, expandable = $$new_props.expandable);
    		if ("batchExpansion" in $$new_props) $$invalidate(11, batchExpansion = $$new_props.batchExpansion);
    		if ("expandedRowIds" in $$new_props) $$invalidate(2, expandedRowIds = $$new_props.expandedRowIds);
    		if ("radio" in $$new_props) $$invalidate(12, radio = $$new_props.radio);
    		if ("selectable" in $$new_props) $$invalidate(3, selectable = $$new_props.selectable);
    		if ("batchSelection" in $$new_props) $$invalidate(13, batchSelection = $$new_props.batchSelection);
    		if ("selectedRowIds" in $$new_props) $$invalidate(4, selectedRowIds = $$new_props.selectedRowIds);
    		if ("stickyHeader" in $$new_props) $$invalidate(14, stickyHeader = $$new_props.stickyHeader);
    		if ("$$scope" in $$new_props) $$invalidate(45, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		headers,
    		rows,
    		size,
    		title,
    		description,
    		zebra,
    		sortable,
    		expandable,
    		batchExpansion,
    		expandedRowIds,
    		radio,
    		selectable,
    		batchSelection,
    		selectedRowIds,
    		stickyHeader,
    		createEventDispatcher,
    		setContext,
    		writable,
    		derived,
    		ChevronRight16,
    		InlineCheckbox,
    		RadioButton,
    		Table,
    		TableBody,
    		TableCell,
    		TableContainer,
    		TableHead,
    		TableHeader,
    		TableRow,
    		sortDirectionMap,
    		dispatch,
    		batchSelectedIds,
    		tableSortable,
    		sortHeader,
    		headerItems,
    		thKeys,
    		expanded,
    		parentRowId,
    		selectAll,
    		refSelectAll,
    		$headerItems,
    		expandedRows,
    		indeterminate,
    		headerKeys,
    		sortedRows,
    		ascending,
    		$sortHeader,
    		sortKey,
    		sorting,
    		$thKeys
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("headers" in $$props) $$invalidate(5, headers = $$new_props.headers);
    		if ("rows" in $$props) $$invalidate(0, rows = $$new_props.rows);
    		if ("size" in $$props) $$invalidate(6, size = $$new_props.size);
    		if ("title" in $$props) $$invalidate(7, title = $$new_props.title);
    		if ("description" in $$props) $$invalidate(8, description = $$new_props.description);
    		if ("zebra" in $$props) $$invalidate(9, zebra = $$new_props.zebra);
    		if ("sortable" in $$props) $$invalidate(10, sortable = $$new_props.sortable);
    		if ("expandable" in $$props) $$invalidate(1, expandable = $$new_props.expandable);
    		if ("batchExpansion" in $$props) $$invalidate(11, batchExpansion = $$new_props.batchExpansion);
    		if ("expandedRowIds" in $$props) $$invalidate(2, expandedRowIds = $$new_props.expandedRowIds);
    		if ("radio" in $$props) $$invalidate(12, radio = $$new_props.radio);
    		if ("selectable" in $$props) $$invalidate(3, selectable = $$new_props.selectable);
    		if ("batchSelection" in $$props) $$invalidate(13, batchSelection = $$new_props.batchSelection);
    		if ("selectedRowIds" in $$props) $$invalidate(4, selectedRowIds = $$new_props.selectedRowIds);
    		if ("stickyHeader" in $$props) $$invalidate(14, stickyHeader = $$new_props.stickyHeader);
    		if ("expanded" in $$props) $$invalidate(15, expanded = $$new_props.expanded);
    		if ("parentRowId" in $$props) $$invalidate(16, parentRowId = $$new_props.parentRowId);
    		if ("selectAll" in $$props) $$invalidate(17, selectAll = $$new_props.selectAll);
    		if ("refSelectAll" in $$props) $$invalidate(18, refSelectAll = $$new_props.refSelectAll);
    		if ("expandedRows" in $$props) $$invalidate(19, expandedRows = $$new_props.expandedRows);
    		if ("indeterminate" in $$props) $$invalidate(20, indeterminate = $$new_props.indeterminate);
    		if ("headerKeys" in $$props) $$invalidate(47, headerKeys = $$new_props.headerKeys);
    		if ("sortedRows" in $$props) $$invalidate(21, sortedRows = $$new_props.sortedRows);
    		if ("ascending" in $$props) $$invalidate(48, ascending = $$new_props.ascending);
    		if ("sortKey" in $$props) $$invalidate(49, sortKey = $$new_props.sortKey);
    		if ("sorting" in $$props) $$invalidate(23, sorting = $$new_props.sorting);
    	};

    	let expandedRows;
    	let indeterminate;
    	let headerKeys;
    	let sortedRows;
    	let ascending;
    	let sortKey;
    	let sorting;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*expandedRowIds*/ 4) {
    			 $$invalidate(19, expandedRows = expandedRowIds.reduce((a, id) => ({ ...a, [id]: true }), {}));
    		}

    		if ($$self.$$.dirty[0] & /*selectedRowIds*/ 16) {
    			 batchSelectedIds.set(selectedRowIds);
    		}

    		if ($$self.$$.dirty[0] & /*headers*/ 32) {
    			 $$invalidate(47, headerKeys = headers.map(({ key }) => key));
    		}

    		if ($$self.$$.dirty[0] & /*rows*/ 1 | $$self.$$.dirty[1] & /*headerKeys*/ 65536) {
    			 $$invalidate(0, rows = rows.map(row => ({
    				...row,
    				cells: headerKeys.map(key => ({ key, value: row[key] }))
    			})));
    		}

    		if ($$self.$$.dirty[0] & /*selectedRowIds, rows*/ 17) {
    			 $$invalidate(20, indeterminate = selectedRowIds.length > 0 && selectedRowIds.length < rows.length);
    		}

    		if ($$self.$$.dirty[0] & /*batchExpansion*/ 2048) {
    			 if (batchExpansion) $$invalidate(1, expandable = true);
    		}

    		if ($$self.$$.dirty[0] & /*radio, batchSelection*/ 12288) {
    			 if (radio || batchSelection) $$invalidate(3, selectable = true);
    		}

    		if ($$self.$$.dirty[0] & /*sortable*/ 1024) {
    			 tableSortable.set(sortable);
    		}

    		if ($$self.$$.dirty[0] & /*rows*/ 1) {
    			 $$invalidate(21, sortedRows = rows);
    		}

    		if ($$self.$$.dirty[0] & /*$sortHeader*/ 4194304) {
    			 $$invalidate(48, ascending = $sortHeader.sortDirection === "ascending");
    		}

    		if ($$self.$$.dirty[0] & /*$sortHeader*/ 4194304) {
    			 $$invalidate(49, sortKey = $sortHeader.key);
    		}

    		if ($$self.$$.dirty[0] & /*sortable*/ 1024 | $$self.$$.dirty[1] & /*sortKey*/ 262144) {
    			 $$invalidate(23, sorting = sortable && sortKey != null);
    		}

    		if ($$self.$$.dirty[0] & /*sorting, $sortHeader, rows*/ 12582913 | $$self.$$.dirty[1] & /*ascending, sortKey*/ 393216) {
    			 if (sorting) {
    				if ($sortHeader.sortDirection === "none") {
    					$$invalidate(21, sortedRows = rows);
    				} else {
    					$$invalidate(21, sortedRows = [...rows].sort((a, b) => {
    						const itemA = ascending ? a[sortKey] : b[sortKey];
    						const itemB = ascending ? b[sortKey] : a[sortKey];
    						if ($sortHeader.sort) return $sortHeader.sort(itemA, itemB);
    						if (typeof itemA === "number" && typeof itemB === "number") return itemA - itemB;
    						return itemA.toString().localeCompare(itemB.toString(), "en", { numeric: true });
    					}));
    				}
    			}
    		}
    	};

    	return [
    		rows,
    		expandable,
    		expandedRowIds,
    		selectable,
    		selectedRowIds,
    		headers,
    		size,
    		title,
    		description,
    		zebra,
    		sortable,
    		batchExpansion,
    		radio,
    		batchSelection,
    		stickyHeader,
    		expanded,
    		parentRowId,
    		selectAll,
    		refSelectAll,
    		expandedRows,
    		indeterminate,
    		sortedRows,
    		$sortHeader,
    		sorting,
    		$thKeys,
    		sortDirectionMap,
    		dispatch,
    		sortHeader,
    		headerItems,
    		thKeys,
    		$$restProps,
    		slots,
    		click_handler,
    		inlinecheckbox_ref_binding,
    		change_handler,
    		click_handler_1,
    		click_handler_2,
    		change_handler_1,
    		change_handler_2,
    		click_handler_3,
    		click_handler_4,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1,
    		$$scope
    	];
    }

    class DataTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$q,
    			create_fragment$q,
    			safe_not_equal,
    			{
    				headers: 5,
    				rows: 0,
    				size: 6,
    				title: 7,
    				description: 8,
    				zebra: 9,
    				sortable: 10,
    				expandable: 1,
    				batchExpansion: 11,
    				expandedRowIds: 2,
    				radio: 12,
    				selectable: 3,
    				batchSelection: 13,
    				selectedRowIds: 4,
    				stickyHeader: 14
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataTable",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get headers() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headers(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zebra() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zebra(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortable() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortable(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expandable() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandable(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get batchExpansion() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set batchExpansion(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expandedRowIds() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandedRowIds(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radio() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radio(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get batchSelection() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set batchSelection(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRowIds() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRowIds(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stickyHeader() {
    		throw new Error("<DataTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stickyHeader(value) {
    		throw new Error("<DataTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Home.svelte generated by Svelte v3.29.4 */
    const file$q = "src\\components\\Home.svelte";

    // (1:0) <script>      import { ProgressCircular }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>      import { ProgressCircular }",
    		ctx
    	});

    	return block;
    }

    // (22:4) {:then val}
    function create_then_block(ctx) {
    	let h50;
    	let t1;
    	let datatable0;
    	let t2;
    	let h51;
    	let t4;
    	let datatable1;
    	let current;

    	datatable0 = new DataTable({
    			props: {
    				class: "noselect",
    				style: "user-select: none",
    				headers: [
    					{ key: "type", value: "Type" },
    					{ key: "price", value: "Price / Token" },
    					{ key: "stock", value: "Stock" }
    				],
    				rows: [
    					{
    						id: "a",
    						type: "Unique Token",
    						price: "0.15 USD",
    						stock: "1923 Tokens"
    					},
    					{
    						id: "b",
    						type: "Shared Token",
    						price: "0.10 USD",
    						stock: "19234 Tokens"
    					}
    				]
    			},
    			$$inline: true
    		});

    	datatable1 = new DataTable({
    			props: {
    				style: "user-select: none",
    				headers: [{ key: "stat", value: "State" }, { key: "value", value: "Value" }],
    				rows: /*val*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h50 = element("h5");
    			h50.textContent = "Token Information";
    			t1 = space();
    			create_component(datatable0.$$.fragment);
    			t2 = space();
    			h51 = element("h5");
    			h51.textContent = "Statistics";
    			t4 = space();
    			create_component(datatable1.$$.fragment);
    			attr_dev(h50, "class", "noselect svelte-13gvdf1");
    			add_location(h50, file$q, 22, 8, 653);
    			attr_dev(h51, "class", "noselect svelte-13gvdf1");
    			set_style(h51, "padding-top", "20px");
    			add_location(h51, file$q, 58, 8, 1779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h50, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(datatable0, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h51, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(datatable1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datatable0.$$.fragment, local);
    			transition_in(datatable1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datatable0.$$.fragment, local);
    			transition_out(datatable1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h50);
    			if (detaching) detach_dev(t1);
    			destroy_component(datatable0, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h51);
    			if (detaching) detach_dev(t4);
    			destroy_component(datatable1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(22:4) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (18:25)           <center>              <ProgressCircular style='margin-top: 25%'size={100}
    function create_pending_block(ctx) {
    	let center;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 25%",
    				size: 100,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			center = element("center");
    			create_component(progresscircular.$$.fragment);
    			add_location(center, file$q, 18, 8, 505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(18:25)           <center>              <ProgressCircular style='margin-top: 25%'size={100}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = dataExists(), info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			attr_dev(main, "class", "svelte-13gvdf1");
    			add_location(main, file$q, 16, 0, 462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function dataExists() {
    	return new Promise(resolve => {
    			const int = setInterval(
    				() => {
    					if (window.statsrows.length != 0) {
    						clearInterval(int);
    						resolve(window.statsrows);
    					}
    				},
    				100
    			);
    		});
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProgressCircular, DataTable, dataExists });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src\components\Tokens.svelte generated by Svelte v3.29.4 */
    const file$r = "src\\components\\Tokens.svelte";

    // (1:0) <script>      import { ProgressCircular }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>      import { ProgressCircular }",
    		ctx
    	});

    	return block;
    }

    // (22:4) {:then val}
    function create_then_block$1(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let t10;
    	let script;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Id";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Type";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Token";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Status";
    			t9 = space();
    			tbody = element("tbody");
    			t10 = space();
    			script = element("script");
    			script.textContent = "window.jQuery('#tokensdata').DataTable({\r\n                data: window.tokendata,\r\n                columns: [\r\n                    { data: 'name'},\r\n                    { data: 'id'},\r\n                    { data: 'type'},\r\n                    { data: 'token'},\r\n                    { data: 'status'}\r\n                ],\r\n                searching: false,\r\n                info: false,\r\n                lengthChange: false,\r\n                pageLength: 15,\r\n                autoWidth: true,\r\n                fixedColumns: true,\r\n                columnDefs: [\r\n                    {\r\n                    targets: '_all',\r\n                    createdCell: (td, celldata, rowdata, row, col) => {\r\n                        const t = window.jQuery(td) \r\n                        \r\n                        // Valid / Invalid text color\r\n                        if (celldata === 'Valid') {\r\n                            t.css('background-color','#5cbc4b')\r\n                        } else if(celldata ==='Invalid') {\r\n                            t.css('background-color', '#BC4B51')\r\n                        }\r\n\r\n                        switch (col) {\r\n                            case 0:\r\n                                t.css({\r\n                                    'user-select': 'none',\r\n                                    'overflow': 'hidden',\r\n                                    'text-overflow': 'ellipsis'\r\n                                })\r\n                                break\r\n                            case 3:\r\n                                t.css({'color':'transparent','text-shadow':'0 0 5px rgba(255,255,255,0.5)',width:\"20%\"})\r\n                                \r\n\r\n                                t.hover(() => {\r\n                                t.css({color:\"white\"})\r\n                                }, () => {\r\n                                    t.css({color:\"transparent\"})\r\n                                })\r\n                                break\r\n                            default: \r\n                                t.css('user-select','none')\r\n                                break\r\n                        }\r\n                    }\r\n                }]\r\n            })";
    			add_location(th0, file$r, 25, 20, 726);
    			add_location(th1, file$r, 26, 20, 761);
    			add_location(th2, file$r, 27, 20, 794);
    			add_location(th3, file$r, 28, 20, 829);
    			add_location(th4, file$r, 29, 20, 865);
    			set_style(tr, "background-color", "#393939");
    			add_location(tr, file$r, 24, 16, 667);
    			add_location(thead, file$r, 23, 12, 642);
    			add_location(tbody, file$r, 32, 12, 939);
    			attr_dev(table, "id", "tokensdata");
    			set_style(table, "width", "100%", 1);
    			add_location(table, file$r, 22, 8, 575);
    			add_location(script, file$r, 34, 8, 982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, script, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(22:4) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (18:26)           <center>              <ProgressCircular style='margin-top: 25%'size={100}
    function create_pending_block$1(ctx) {
    	let center;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 25%",
    				size: 100,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			center = element("center");
    			create_component(progresscircular.$$.fragment);
    			add_location(center, file$r, 18, 8, 426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(18:26)           <center>              <ProgressCircular style='margin-top: 25%'size={100}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = tokenLoaded(), info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			attr_dev(main, "class", "svelte-1gpr9sn");
    			add_location(main, file$r, 16, 0, 382);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function tokenLoaded() {
    	return new Promise(resolve => {
    			const int = setInterval(
    				() => {
    					if (window.tokendata) {
    						clearInterval(int);
    						resolve();
    					}
    				},
    				250
    			);
    		});
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tokens", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tokens> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProgressCircular, tokenLoaded });
    	return [];
    }

    class Tokens extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tokens",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src\components\Servers.svelte generated by Svelte v3.29.4 */
    const file$s = "src\\components\\Servers.svelte";

    // (1:0) <script>      import { ProgressCircular }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>      import { ProgressCircular }",
    		ctx
    	});

    	return block;
    }

    // (21:4) {:then val}
    function create_then_block$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let t8;
    	let script;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Id";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Members";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Admin";
    			t7 = space();
    			tbody = element("tbody");
    			t8 = space();
    			script = element("script");
    			script.textContent = "window.jQuery('#serversdata').DataTable({\r\n                data: window.serverdata,\r\n                columns: [\r\n                    { data: 'name' },\r\n                    { data: 'id' },\r\n                    { data: 'members' },\r\n                    { data: 'admin' },\r\n                ],\r\n                searching: false,\r\n                info: false,\r\n                lengthChange: false,\r\n                pageLength: 15,\r\n                autoWidth: true,\r\n                columnDefs: [{\r\n                    targets: '_all',\r\n                    createdCell: (td, celldata, rowdata, row, col) => {\r\n                        const t = window.jQuery(td) \r\n                        \r\n                        // Valid / Invalid text color\r\n                        if (celldata === true) {\r\n                            t.css('background-color','#5cbc4b')\r\n                        } else if(celldata === false) {\r\n                            t.css('background-color', '#BC4B51')\r\n                        }\r\n                    }\r\n                }]\r\n            })";
    			add_location(th0, file$s, 24, 20, 725);
    			add_location(th1, file$s, 25, 20, 760);
    			add_location(th2, file$s, 26, 20, 793);
    			add_location(th3, file$s, 27, 20, 831);
    			set_style(tr, "background-color", "#393939");
    			add_location(tr, file$s, 23, 16, 666);
    			add_location(thead, file$s, 22, 12, 641);
    			add_location(tbody, file$s, 30, 12, 904);
    			attr_dev(table, "id", "serversdata");
    			set_style(table, "width", "100%", 1);
    			add_location(table, file$s, 21, 8, 573);
    			add_location(script, file$s, 32, 8, 947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, script, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(21:4) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (17:26)            <center>              <ProgressCircular style='margin-top: 25%'size={100}
    function create_pending_block$2(ctx) {
    	let center;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 25%",
    				size: 100,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			center = element("center");
    			create_component(progresscircular.$$.fragment);
    			add_location(center, file$s, 17, 8, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(17:26)            <center>              <ProgressCircular style='margin-top: 25%'size={100}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = serversLoaded, info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			attr_dev(main, "class", "svelte-1u35wis");
    			add_location(main, file$s, 15, 0, 380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function serversLoaded() {
    	return new Promise(resolve => {
    			const int = setInterval(
    				() => {
    					if (window.serverdata) {
    						clearInterval(int);
    						resolve();
    					}
    				},
    				250
    			);
    		});
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Servers", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Servers> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProgressCircular, serversLoaded });
    	return [];
    }

    class Servers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Servers",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src\components\Console.svelte generated by Svelte v3.29.4 */
    const file$t = "src\\components\\Console.svelte";

    // (25:8) <Button style="position: fixed" >
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("execute");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(25:8) <Button style=\\\"position: fixed\\\" >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let main;
    	let div6;
    	let div1;
    	let h50;
    	let t1;
    	let div0;
    	let t2;
    	let div3;
    	let h51;
    	let t4;
    	let div2;
    	let t5;
    	let div5;
    	let h52;
    	let t7;
    	let div4;
    	let t8;
    	let div7;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				style: "position: fixed",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div6 = element("div");
    			div1 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Input";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div3 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Output";
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div5 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Scripts";
    			t7 = space();
    			div4 = element("div");
    			t8 = space();
    			div7 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(h50, "class", "titlebar svelte-1yg5ccu");
    			add_location(h50, file$t, 9, 12, 275);
    			attr_dev(div0, "id", "editor1");
    			set_style(div0, "width", "100%");
    			set_style(div0, "height", "calc(100% - 40px)");
    			add_location(div0, file$t, 10, 12, 320);
    			attr_dev(div1, "id", "side1");
    			set_style(div1, "width", "calc(40% - 10px)");
    			set_style(div1, "height", "100%");
    			set_style(div1, "float", "left");
    			add_location(div1, file$t, 8, 8, 190);
    			attr_dev(h51, "class", "titlebar svelte-1yg5ccu");
    			add_location(h51, file$t, 13, 12, 518);
    			attr_dev(div2, "id", "editor2");
    			set_style(div2, "width", "100%");
    			set_style(div2, "height", "calc(100% - 40px)");
    			add_location(div2, file$t, 14, 12, 564);
    			attr_dev(div3, "id", "side2");
    			set_style(div3, "width", "calc(40% - 10px)");
    			set_style(div3, "height", "100%");
    			set_style(div3, "float", "left");
    			set_style(div3, "padding-left", "10px");
    			add_location(div3, file$t, 12, 8, 414);
    			attr_dev(h52, "class", "titlebar svelte-1yg5ccu");
    			add_location(h52, file$t, 17, 12, 766);
    			attr_dev(div4, "id", "scripts");
    			set_style(div4, "height", "calc(100% - 40px)");
    			set_style(div4, "width", "100%");
    			set_style(div4, "background-color", "#191919");
    			add_location(div4, file$t, 18, 12, 813);
    			attr_dev(div5, "id", "side3");
    			set_style(div5, "width", "calc(20% - 10px)");
    			set_style(div5, "height", "109.5%");
    			set_style(div5, "float", "left");
    			set_style(div5, "padding-left", "10px");
    			add_location(div5, file$t, 16, 8, 658);
    			set_style(div6, "width", "100%");
    			set_style(div6, "height", "90%");
    			set_style(div6, "margin-bottom", "0");
    			add_location(div6, file$t, 7, 4, 124);
    			attr_dev(div7, "id", "bottombar");
    			set_style(div7, "width", "calc(80% - 20px)");
    			set_style(div7, "height", "calc(10% - 20px)");
    			set_style(div7, "background-color", "#191919");
    			add_location(div7, file$t, 23, 4, 964);
    			attr_dev(main, "class", "svelte-1yg5ccu");
    			add_location(main, file$t, 6, 0, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div1);
    			append_dev(div1, h50);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div3, h51);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, h52);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(main, t8);
    			append_dev(main, div7);
    			mount_component(button, div7, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Console", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Console> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button, onMount });
    	return [];
    }

    class Console extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Console",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src\components\Box.svelte generated by Svelte v3.29.4 */

    const file$u = "src\\components\\Box.svelte";

    function create_fragment$v(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "box svelte-14zwarm");
    			add_location(div, file$u, 5, 4, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Box", slots, ['default']);
    	let { ref } = $$props;
    	const writable_props = ["ref"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ ref });

    	$$self.$inject_state = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ref, $$scope, slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { ref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$v.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ref*/ ctx[0] === undefined && !("ref" in props)) {
    			console.warn("<Box> was created without expected prop 'ref'");
    		}
    	}

    	get ref() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\DashBoard.svelte generated by Svelte v3.29.4 */

    const { console: console_1$1 } = globals;
    const file$v = "src\\components\\DashBoard.svelte";

    // (1:0) <script>        import Box from "./Box.svelte"      import FaServer from 'svelte-icons/fa/FaServer.svelte'      import FaCoins from 'svelte-icons/fa/FaCoins.svelte'      import { ProgressCircular }
    function create_catch_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>        import Box from \\\"./Box.svelte\\\"      import FaServer from 'svelte-icons/fa/FaServer.svelte'      import FaCoins from 'svelte-icons/fa/FaCoins.svelte'      import { ProgressCircular }",
    		ctx
    	});

    	return block;
    }

    // (41:12) {:then val}
    function create_then_block_1(ctx) {
    	let h4;
    	let t1;
    	let hr;
    	let t2;
    	let br;
    	let t3;
    	let div1;
    	let div0;
    	let facoins;
    	let t4;
    	let h5;
    	let t5_value = /*val*/ ctx[0].length + "";
    	let t5;
    	let current;
    	facoins = new FaCoins({ $$inline: true });

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Loaded Tokens";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(facoins.$$.fragment);
    			t4 = space();
    			h5 = element("h5");
    			t5 = text(t5_value);
    			set_style(h4, "user-select", "none");
    			add_location(h4, file$v, 41, 16, 1219);
    			attr_dev(hr, "class", "svelte-s8gc9l");
    			add_location(hr, file$v, 42, 16, 1286);
    			add_location(br, file$v, 43, 16, 1310);
    			set_style(div0, "width", "45px");
    			set_style(div0, "margin-right", "20px ");
    			add_location(div0, file$v, 45, 20, 1398);
    			set_style(h5, "user-select", "none");
    			add_location(h5, file$v, 50, 20, 1559);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-flow", "row ");
    			add_location(div1, file$v, 44, 16, 1333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(facoins, div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, h5);
    			append_dev(h5, t5);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(facoins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(facoins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(facoins);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(41:12) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (37:35)                   <center>                      <ProgressCircular style='margin-top: 25%'size={20}
    function create_pending_block_1(ctx) {
    	let center;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 25%",
    				size: 20,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			center = element("center");
    			create_component(progresscircular.$$.fragment);
    			add_location(center, file$v, 37, 16, 1040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(37:35)                   <center>                      <ProgressCircular style='margin-top: 25%'size={20}",
    		ctx
    	});

    	return block;
    }

    // (36:8) <Box ref="b_t" >
    function create_default_slot_1$1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = TokensLoaded(), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(36:8) <Box ref=\\\"b_t\\\" >",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>        import Box from "./Box.svelte"      import FaServer from 'svelte-icons/fa/FaServer.svelte'      import FaCoins from 'svelte-icons/fa/FaCoins.svelte'      import { ProgressCircular }
    function create_catch_block$3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>        import Box from \\\"./Box.svelte\\\"      import FaServer from 'svelte-icons/fa/FaServer.svelte'      import FaCoins from 'svelte-icons/fa/FaCoins.svelte'      import { ProgressCircular }",
    		ctx
    	});

    	return block;
    }

    // (60:12) {:then val}
    function create_then_block$3(ctx) {
    	let h4;
    	let t1;
    	let hr;
    	let t2;
    	let br;
    	let t3;
    	let div1;
    	let div0;
    	let faserver;
    	let t4;
    	let h5;
    	let t5_value = /*val*/ ctx[0].length + "";
    	let t5;
    	let current;
    	faserver = new FaServer({ $$inline: true });

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Loaded Servers";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(faserver.$$.fragment);
    			t4 = space();
    			h5 = element("h5");
    			t5 = text(t5_value);
    			set_style(h4, "user-select", "none");
    			add_location(h4, file$v, 60, 16, 1935);
    			attr_dev(hr, "class", "svelte-s8gc9l");
    			add_location(hr, file$v, 61, 16, 2003);
    			add_location(br, file$v, 62, 16, 2027);
    			set_style(div0, "width", "45px");
    			set_style(div0, "margin-right", "20px ");
    			add_location(div0, file$v, 64, 20, 2115);
    			set_style(h5, "user-select", "none");
    			add_location(h5, file$v, 69, 20, 2277);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-flow", "row ");
    			add_location(div1, file$v, 63, 16, 2050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(faserver, div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, h5);
    			append_dev(h5, t5);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(faserver);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(60:12) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (56:36)                   <center>                      <ProgressCircular style='margin-top: 25%'size={20}
    function create_pending_block$3(ctx) {
    	let center;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 25%",
    				size: 20,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			center = element("center");
    			create_component(progresscircular.$$.fragment);
    			add_location(center, file$v, 56, 16, 1756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(56:36)                   <center>                      <ProgressCircular style='margin-top: 25%'size={20}",
    		ctx
    	});

    	return block;
    }

    // (55:8) <Box ref="b_s" >
    function create_default_slot$8(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = serversLoaded$1(), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(55:8) <Box ref=\\\"b_s\\\" >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let main;
    	let div;
    	let box0;
    	let t;
    	let box1;
    	let current;

    	box0 = new Box({
    			props: {
    				ref: "b_t",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box1 = new Box({
    			props: {
    				ref: "b_s",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(box0.$$.fragment);
    			t = space();
    			create_component(box1.$$.fragment);
    			attr_dev(div, "class", "box-previews svelte-s8gc9l");
    			add_location(div, file$v, 34, 4, 931);
    			add_location(main, file$v, 33, 0, 919);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(box0, div, null);
    			append_dev(div, t);
    			mount_component(box1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box0_changes.$$scope = { dirty, ctx };
    			}

    			box0.$set(box0_changes);
    			const box1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box1_changes.$$scope = { dirty, ctx };
    			}

    			box1.$set(box1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box0.$$.fragment, local);
    			transition_in(box1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box0.$$.fragment, local);
    			transition_out(box1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(box0);
    			destroy_component(box1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function TokensLoaded() {
    	return new Promise(resolve => {
    			const int = setInterval(
    				() => {
    					if (window.tokendata) {
    						clearInterval(int);
    						console.log(window.tokendata);
    						resolve(window.tokendata);
    					}
    				},
    				250
    			);
    		});
    }

    async function serversLoaded$1() {
    	return new Promise(resolve => {
    			const int = setInterval(
    				() => {
    					if (window.serverdata) {
    						clearInterval(int);
    						resolve(window.serverdata);
    					}
    				},
    				250
    			);
    		});
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DashBoard", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DashBoard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Box,
    		FaServer,
    		FaCoins,
    		ProgressCircular,
    		TokensLoaded,
    		serversLoaded: serversLoaded$1
    	});

    	return [];
    }

    class DashBoard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DashBoard",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.4 */

    const { console: console_1$2 } = globals;
    const file$w = "src\\App.svelte";

    // (1:0) <script>   // export let name;   import { onMount }
    function create_catch_block$4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(1:0) <script>   // export let name;   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (119:1) {:then val}
    function create_then_block$4(ctx) {
    	let div0;
    	let navigationdrawer;
    	let t;
    	let div1;
    	let router;
    	let current;
    	let mounted;
    	let dispose;

    	navigationdrawer = new NavigationDrawer({
    			props: {
    				mini: /*mini*/ ctx[0],
    				style: "background-color: #964044;float: left; position: fixed; z-index: 12; top: 30px",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	router = new Router({
    			props: { routes: /*routes*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(navigationdrawer.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			set_style(div0, "height", "100%");
    			attr_dev(div0, "class", "d-inline-block");
    			attr_dev(div0, "id", "nav");
    			add_location(div0, file$w, 119, 2, 3491);
    			attr_dev(div1, "id", "wrapper");
    			set_style(div1, "float", "right");
    			set_style(div1, "width", "calc(100% - 56px)");
    			set_style(div1, "height", "calc(100% - 30px)");
    			set_style(div1, "margin-top", "30px");
    			add_location(div1, file$w, 174, 2, 5164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(navigationdrawer, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(router, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mouseenter", /*enter*/ ctx[3], false, false, false),
    					listen_dev(div0, "mouseleave", /*leave*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const navigationdrawer_changes = {};
    			if (dirty & /*mini*/ 1) navigationdrawer_changes.mini = /*mini*/ ctx[0];

    			if (dirty & /*$$scope*/ 131072) {
    				navigationdrawer_changes.$$scope = { dirty, ctx };
    			}

    			navigationdrawer.$set(navigationdrawer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigationdrawer.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigationdrawer.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(navigationdrawer);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_component(router);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(119:1) {:then val}",
    		ctx
    	});

    	return block;
    }

    // (124:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot_5(ctx) {
    	let span;
    	let div;
    	let fahome;
    	let current;
    	fahome = new FaHome({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(fahome.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 124, 7, 3858);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 123, 6, 3783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(fahome, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fahome.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fahome.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(fahome);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot_5.name,
    		type: "slot",
    		source: "(124:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (123:5) <ListItem on:click={() => push('/')}>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tHome");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(123:5) <ListItem on:click={() => push('/')}>",
    		ctx
    	});

    	return block;
    }

    // (133:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot_4(ctx) {
    	let span;
    	let div;
    	let fadungeon;
    	let current;
    	fadungeon = new FaDungeon({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(fadungeon.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 133, 7, 4097);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 132, 6, 4022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(fadungeon, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fadungeon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fadungeon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(fadungeon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot_4.name,
    		type: "slot",
    		source: "(133:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (132:5) <ListItem on:click={() => push('/dash')} >
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tDashboard");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(132:5) <ListItem on:click={() => push('/dash')} >",
    		ctx
    	});

    	return block;
    }

    // (141:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot_3(ctx) {
    	let span;
    	let div;
    	let facoins;
    	let current;
    	facoins = new FaCoins({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(facoins.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 141, 7, 4336);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 140, 6, 4261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(facoins, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(facoins.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(facoins.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(facoins);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot_3.name,
    		type: "slot",
    		source: "(141:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (140:5) <ListItem on:click={() => push('/tokens')}>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tTokens");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(140:5) <ListItem on:click={() => push('/tokens')}>",
    		ctx
    	});

    	return block;
    }

    // (149:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot_2(ctx) {
    	let span;
    	let div;
    	let fahdd;
    	let current;
    	fahdd = new FaHdd({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(fahdd.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 149, 7, 4571);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 148, 6, 4496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(fahdd, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fahdd.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fahdd.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(fahdd);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot_2.name,
    		type: "slot",
    		source: "(149:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (148:5) <ListItem on:click={() => push('/servers')}>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tServers");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(148:5) <ListItem on:click={() => push('/servers')}>",
    		ctx
    	});

    	return block;
    }

    // (157:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot_1(ctx) {
    	let span;
    	let div;
    	let faserver;
    	let current;
    	faserver = new FaServer({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(faserver.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 157, 7, 4805);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 156, 6, 4730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(faserver, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faserver);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot_1.name,
    		type: "slot",
    		source: "(157:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (156:5) <ListItem on:click={() => push('/console')}>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tConsole");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(156:5) <ListItem on:click={() => push('/console')}>",
    		ctx
    	});

    	return block;
    }

    // (165:6) <span slot="prepend" style="padding-right: 10px;padding-top: 5px">
    function create_prepend_slot(ctx) {
    	let span;
    	let div;
    	let faaligncenter;
    	let current;
    	faaligncenter = new FaAlignCenter({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			create_component(faaligncenter.$$.fragment);
    			attr_dev(div, "class", "icon svelte-18o1eqs");
    			add_location(div, file$w, 165, 7, 5008);
    			attr_dev(span, "slot", "prepend");
    			set_style(span, "padding-right", "10px");
    			set_style(span, "padding-top", "5px");
    			add_location(span, file$w, 164, 6, 4933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			mount_component(faaligncenter, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faaligncenter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faaligncenter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faaligncenter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot.name,
    		type: "slot",
    		source: "(165:6) <span slot=\\\"prepend\\\" style=\\\"padding-right: 10px;padding-top: 5px\\\">",
    		ctx
    	});

    	return block;
    }

    // (164:5) <ListItem>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\r\n\t\t\t\t\t\tLogs");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(164:5) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (122:4) <List dense nav>
    function create_default_slot_2$1(ctx) {
    	let listitem0;
    	let t0;
    	let listitem1;
    	let t1;
    	let listitem2;
    	let t2;
    	let listitem3;
    	let t3;
    	let listitem4;
    	let t4;
    	let listitem5;
    	let current;

    	listitem0 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_8$1],
    					prepend: [create_prepend_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem0.$on("click", /*click_handler_3*/ ctx[9]);

    	listitem1 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_7$1],
    					prepend: [create_prepend_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem1.$on("click", /*click_handler_4*/ ctx[10]);

    	listitem2 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_6$1],
    					prepend: [create_prepend_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem2.$on("click", /*click_handler_5*/ ctx[11]);

    	listitem3 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_5$1],
    					prepend: [create_prepend_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem3.$on("click", /*click_handler_6*/ ctx[12]);

    	listitem4 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_4$1],
    					prepend: [create_prepend_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem4.$on("click", /*click_handler_7*/ ctx[13]);

    	listitem5 = new ListItem({
    			props: {
    				$$slots: {
    					default: [create_default_slot_3$1],
    					prepend: [create_prepend_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem0.$$.fragment);
    			t0 = space();
    			create_component(listitem1.$$.fragment);
    			t1 = space();
    			create_component(listitem2.$$.fragment);
    			t2 = space();
    			create_component(listitem3.$$.fragment);
    			t3 = space();
    			create_component(listitem4.$$.fragment);
    			t4 = space();
    			create_component(listitem5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(listitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(listitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(listitem4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(listitem5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem0_changes.$$scope = { dirty, ctx };
    			}

    			listitem0.$set(listitem0_changes);
    			const listitem1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem1_changes.$$scope = { dirty, ctx };
    			}

    			listitem1.$set(listitem1_changes);
    			const listitem2_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem2_changes.$$scope = { dirty, ctx };
    			}

    			listitem2.$set(listitem2_changes);
    			const listitem3_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem3_changes.$$scope = { dirty, ctx };
    			}

    			listitem3.$set(listitem3_changes);
    			const listitem4_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem4_changes.$$scope = { dirty, ctx };
    			}

    			listitem4.$set(listitem4_changes);
    			const listitem5_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				listitem5_changes.$$scope = { dirty, ctx };
    			}

    			listitem5.$set(listitem5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem0.$$.fragment, local);
    			transition_in(listitem1.$$.fragment, local);
    			transition_in(listitem2.$$.fragment, local);
    			transition_in(listitem3.$$.fragment, local);
    			transition_in(listitem4.$$.fragment, local);
    			transition_in(listitem5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem0.$$.fragment, local);
    			transition_out(listitem1.$$.fragment, local);
    			transition_out(listitem2.$$.fragment, local);
    			transition_out(listitem3.$$.fragment, local);
    			transition_out(listitem4.$$.fragment, local);
    			transition_out(listitem5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(listitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(listitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(listitem4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(listitem5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(122:4) <List dense nav>",
    		ctx
    	});

    	return block;
    }

    // (121:3) <NavigationDrawer {mini} style="background-color: #964044;float: left; position: fixed; z-index: 12; top: 30px">
    function create_default_slot_1$2(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				dense: true,
    				nav: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(121:3) <NavigationDrawer {mini} style=\\\"background-color: #964044;float: left; position: fixed; z-index: 12; top: 30px\\\">",
    		ctx
    	});

    	return block;
    }

    // (111:20)     <div id='loader'>     <center>      <h4 class='noselect'style='margin-top: 20%'>Loading Tokens...</h4>      <h5 class='noselect'style='margin-top: 30px'>{status}
    function create_pending_block$4(ctx) {
    	let div;
    	let center;
    	let h4;
    	let t1;
    	let h5;
    	let t2;
    	let t3;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				style: "margin-top: 45px",
    				size: 100,
    				indeterminate: true,
    				color: "red"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			center = element("center");
    			h4 = element("h4");
    			h4.textContent = "Loading Tokens...";
    			t1 = space();
    			h5 = element("h5");
    			t2 = text(/*status*/ ctx[1]);
    			t3 = space();
    			create_component(progresscircular.$$.fragment);
    			attr_dev(h4, "class", "noselect svelte-18o1eqs");
    			set_style(h4, "margin-top", "20%");
    			add_location(h4, file$w, 113, 4, 3232);
    			attr_dev(h5, "class", "noselect svelte-18o1eqs");
    			set_style(h5, "margin-top", "30px");
    			add_location(h5, file$w, 114, 4, 3304);
    			add_location(center, file$w, 112, 3, 3218);
    			attr_dev(div, "id", "loader");
    			attr_dev(div, "class", "svelte-18o1eqs");
    			add_location(div, file$w, 111, 2, 3196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, center);
    			append_dev(center, h4);
    			append_dev(center, t1);
    			append_dev(center, h5);
    			append_dev(h5, t2);
    			append_dev(center, t3);
    			mount_component(progresscircular, center, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*status*/ 2) set_data_dev(t2, /*status*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(111:20)     <div id='loader'>     <center>      <h4 class='noselect'style='margin-top: 20%'>Loading Tokens...</h4>      <h5 class='noselect'style='margin-top: 30px'>{status}",
    		ctx
    	});

    	return block;
    }

    // (93:0) <MaterialApp theme="dark">
    function create_default_slot$9(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let div5;
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t3;
    	let div4;
    	let h6;
    	let t5;
    	let await_block_anchor;
    	let promise;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 16,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*isLoaded*/ ctx[5](), info);

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t3 = space();
    			div4 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Bot Tools";
    			t5 = space();
    			await_block_anchor = empty();
    			info.block.c();
    			if (script.src !== (script_src_value = "./jquery.dataTables.min.js")) attr_dev(script, "src", script_src_value);
    			script.defer = true;
    			add_location(script, file$w, 93, 1, 2639);
    			if (img0.src !== (img0_src_value = "./min.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-18o1eqs");
    			add_location(img0, file$w, 97, 4, 2808);
    			attr_dev(div0, "class", "iconb svelte-18o1eqs");
    			add_location(div0, file$w, 96, 3, 2742);
    			if (img1.src !== (img1_src_value = "./max.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-18o1eqs");
    			add_location(img1, file$w, 100, 4, 2918);
    			attr_dev(div1, "class", "iconb svelte-18o1eqs");
    			add_location(div1, file$w, 99, 3, 2853);
    			if (img2.src !== (img2_src_value = "./close.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-18o1eqs");
    			add_location(img2, file$w, 103, 4, 3042);
    			attr_dev(div2, "class", "iconb svelte-18o1eqs");
    			attr_dev(div2, "id", "close");
    			add_location(div2, file$w, 102, 3, 2964);
    			attr_dev(div3, "id", "buttons");
    			attr_dev(div3, "class", "svelte-18o1eqs");
    			add_location(div3, file$w, 95, 2, 2719);
    			attr_dev(h6, "id", "title");
    			attr_dev(h6, "class", "svelte-18o1eqs");
    			add_location(h6, file$w, 107, 3, 3121);
    			attr_dev(div4, "id", "maintop");
    			attr_dev(div4, "class", "svelte-18o1eqs");
    			add_location(div4, file$w, 106, 2, 3098);
    			attr_dev(div5, "id", "topbar");
    			attr_dev(div5, "class", "svelte-18o1eqs");
    			add_location(div5, file$w, 94, 1, 2698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, script, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, img1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, img2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, h6);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(93:0) <MaterialApp theme=\\\"dark\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: "dark",
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, status, mini*/ 131075) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const routes = {
    		"/": Home,
    		"/tokens": Tokens,
    		"/servers": Servers,
    		"/console": Console,
    		"/dash": DashBoard
    	};

    	// Electron funcs to control app
    	const { ipcRenderer } = require("electron");

    	window.ipc = ipcRenderer;

    	// Handle side bar movement
    	let mini = true;

    	function enter() {
    		$$invalidate(0, mini = false);
    	}

    	function leave() {
    		$$invalidate(0, mini = true);
    	}

    	// Create websocket for interprocess transfer
    	let opened = false;

    	let status = "Launching websocket";
    	window.socket = new WebSocket("ws://localhost:32875");

    	socket.onmessage = event => {
    		const { type, data } = JSON.parse(event.data);

    		switch (type) {
    			case "statistics":
    				const { total, success, failed, servers, members } = data;
    				opened = true;
    				window.statsrows = [
    					{
    						id: "a",
    						stat: "Total Tokens",
    						value: total
    					},
    					{
    						id: "b",
    						stat: "Total Valid Tokens",
    						value: success
    					},
    					{
    						id: "c",
    						stat: "Total Invalid Tokens",
    						value: failed
    					},
    					{
    						id: "d",
    						stat: "Total Servers",
    						value: servers
    					},
    					{
    						id: "e",
    						stat: "Total Server Members",
    						value: members
    					}
    				];
    			case "tokenupdate":
    				$$invalidate(1, status = data.text || "");
    			case "tokens":
    				window.tokendata = data;
    			case "servers":
    				window.serverdata = data;
    			default:
    				window[type + "data"] = data;
    				break;
    		}
    	};

    	socket.onopen = () => {
    		console.log("opened");
    	};

    	// Assert certain data for other pages info that will be transfered via websocket
    	window.statsrows = [];

    	window.editors = [];

    	// Wait for all tokens to load
    	async function isLoaded() {
    		return new Promise(resolve => {
    				const int = setInterval(
    					() => {
    						if (opened) {
    							clearInterval(int);
    							resolve(true);
    						}
    					},
    					250
    				);
    			});
    	}

    	onMount(() => {
    		window.jQuery = jquery;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.ipc.send("min");
    	const click_handler_1 = () => window.ipc.send("max");
    	const click_handler_2 = () => window.ipc.send("close");
    	const click_handler_3 = () => push("/");
    	const click_handler_4 = () => push("/dash");
    	const click_handler_5 = () => push("/tokens");
    	const click_handler_6 = () => push("/servers");
    	const click_handler_7 = () => push("/console");

    	$$self.$capture_state = () => ({
    		onMount,
    		MaterialApp,
    		NavigationDrawer,
    		List,
    		ListItem,
    		ProgressCircular,
    		push,
    		Router,
    		jQuery: jquery,
    		FaHome,
    		FaCoins,
    		FaHdd,
    		FaDungeon,
    		FaServer,
    		FaAlignCenter,
    		Home,
    		Tokens,
    		Servers,
    		Console,
    		Dashboard: DashBoard,
    		routes,
    		ipcRenderer,
    		mini,
    		enter,
    		leave,
    		opened,
    		status,
    		isLoaded
    	});

    	$$self.$inject_state = $$props => {
    		if ("mini" in $$props) $$invalidate(0, mini = $$props.mini);
    		if ("opened" in $$props) opened = $$props.opened;
    		if ("status" in $$props) $$invalidate(1, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		mini,
    		status,
    		routes,
    		enter,
    		leave,
    		isLoaded,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

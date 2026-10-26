const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

function nodes(value) {
  if (!value || typeof value !== 'object') return [];
  return Array.isArray(value) ? value.flatMap(nodes) : [value, ...nodes(value.props?.children)];
}
function text(value) {
  if (Array.isArray(value)) return value.map(text).join('');
  return value == null || typeof value === 'boolean' ? '' : typeof value === 'object' ? text(value.props?.children) : String(value);
}
function harness() {
  const states = [], refs = [], effectDeps = [], pendingEffects = [], events = [], requests = [];
  let stateIndex = 0, refIndex = 0, effectIndex = 0;
  let response = { ok: true, data: { billingMode: 'manual', status: 'pending_manual_review', requestId: 'FICTIONAL-FOCUS-REFERENCE' } };
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useRef(initial) {
      const index = refIndex++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useEffect(callback, deps) {
      const index = effectIndex++;
      const previous = effectDeps[index];
      if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous[i]))) pendingEffects.push(callback);
      effectDeps[index] = deps;
    },
  };
  const exports = {};
  const context = {
    module: { exports }, exports,
    alert(message) { events.push({ type: 'alert', message }); },
    fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      return { ok: response.ok, json: async () => response.data };
    },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react-router-dom') return {useNavigate:()=>()=>{}};
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => String(key) });
      throw new Error(`Unexpected import ${name}`);
    },
  };
  const built = esbuild.buildSync({entryPoints:[path.resolve(__dirname, '../src/pages/GetStarted.jsx')],bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',write:false});
  vm.runInNewContext(built.outputFiles[0].text, context);
  const h = {
    events, requests,
    setResponse(value) { response = value; },
    render() {
      stateIndex = 0; refIndex = 0; effectIndex = 0;
      return context.module.exports.default();
    },
    commit() {
      const tree = h.render();
      for (const ref of refs) if (ref.current && typeof ref.current === 'object' && ref.current.isHeading) ref.current = null;
      for (const node of nodes(tree)) {
        if (node.props?.ref && typeof node.props.ref === 'object') {
          const heading = text(node);
          node.props.ref.current = {
            isHeading: true,
            focus(options) { events.push({ type: 'focus', heading, preventScroll: options?.preventScroll }); },
            scrollIntoView(options) { events.push({ type: 'scroll', heading, block: options?.block, behavior: options?.behavior }); },
          };
        }
      }
      for (const callback of pendingEffects.splice(0)) callback();
      return tree;
    },
    fill(name, value) {
      const input = nodes(h.render()).find(node => node.type === 'input' && node.props.name === name);
      assert.ok(input, name);
      input.props.onChange({ target: { name, value } });
    },
    click(label) {
      const button = nodes(h.render()).find(node => node.type === 'button' && text(node) === label);
      assert.ok(button, label);
      return button.props.onClick();
    },
  };
  return h;
}
function information(h) {
  for (const [name, value] of Object.entries({ firstName: 'Fictional', lastName: 'Focus', email: 'focus@example.invalid', phone: '5125550100' })) h.fill(name, value);
}
function review(h) {
  information(h); h.click('Next Step'); h.commit(); h.click('Buy a Home'); h.commit();
  nodes(h.render()).find(node => node.type === 'button' && text(node).includes('Single Enrollment')).props.onClick();
  h.fill('billingZip', '00000');
  nodes(h.render()).find(node => node.type === 'input' && node.props.id === 'creditReportAgreement').props.onChange({ target: { checked: true } });
  h.commit();
}
function assertTransition(h, start, heading) {
  const events = h.events.slice(start);
  assert.deepEqual(events.map(event => event.type), ['focus', 'scroll']);
  assert.equal(events[0].heading, heading);
  assert.equal(events[0].preventScroll, true);
  assert.equal(events[1].heading, heading);
  assert.equal(events[1].block, 'start');
  assert.equal(events[1].behavior, 'auto');
  const headingNode = nodes(h.render()).find(node => /^h[1-6]$/.test(node.type) && text(node) === heading);
  assert.equal(headingNode.props.tabIndex, -1);
  assert.match(headingNode.props.className, /scroll-mt-32/);
}

test('initial inquiry mount does not steal focus or change the viewport', () => {
  const h = harness(); h.commit(); h.commit();
  assert.deepEqual(h.events, []);
});
test('valid forward and back transitions focus and reveal the current step heading', () => {
  const h = harness(); h.commit(); information(h);
  for (const label of ['Next Step', 'Back', 'Next Step', 'Buy a Home', 'Back']) {
    const start = h.events.length;
    h.click(label); h.commit();
    assertTransition(h, start, 'Get Started');
  }
  h.click('Back'); h.commit();
  assert.equal(nodes(h.render()).find(node => node.props?.name === 'firstName').props.value, 'Fictional');
});
test('saved inquiry focuses and reveals Enrollment received with its persisted reference', async () => {
  const h = harness(); h.commit(); review(h);
  const start = h.events.length;
  await h.click('Get Started Now'); h.commit();
  assertTransition(h, start, 'Enrollment received');
  assert.match(text(h.render()), /FICTIONAL-FOCUS-REFERENCE/);
  assert.equal(h.requests[0].url, '/api/enroll');
  assert.equal(h.requests[0].body.plan, 'single');
});
test('rejected save stays in review without a focus jump and keeps the retry draft', async () => {
  const h = harness(); h.commit(); review(h);
  h.setResponse({ ok: false, data: { error: 'Fictional save failure' } });
  const start = h.events.length;
  await h.click('Get Started Now'); h.commit();
  assert.equal(h.events.length, start);
  assert.match(text(h.render()), /Fictional save failure/);
  assert.doesNotMatch(text(h.render()), /Enrollment received/);
  assert.equal(nodes(h.render()).find(node => node.props?.name === 'billingZip').props.value, '00000');
  assert.equal(nodes(h.render()).find(node => node.props?.id === 'creditReportAgreement').props.checked, true);
  h.setResponse({ ok: true, data: { billingMode: 'manual', status: 'pending_manual_review', requestId: 'FICTIONAL-RETRY-REFERENCE' } });
  await h.click('Get Started Now'); h.commit();
  assertTransition(h, start, 'Enrollment received');
  assert.match(text(h.render()), /FICTIONAL-RETRY-REFERENCE/);
  assert.equal(h.requests[0].body.firstName, h.requests[1].body.firstName);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {MemoryRouter, Routes, Route} = require('react-router-dom');
function render(file, name='default', route=null) {
 const mod={exports:{}};
 const code=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src',file)],bundle:true,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},write:false,jsx:'automatic'}).outputFiles[0].text;
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require,console,URLSearchParams});
 return renderToStaticMarkup(React.createElement(MemoryRouter,route?{initialEntries:[route]}:null,route ? React.createElement(Routes,null,React.createElement(Route,{path:'/articles/:slug',element:React.createElement(mod.exports[name])})) : React.createElement(mod.exports[name])));
}
const internal=/Unpublished design preview|Layout preview|Review layout space|review spaces|awaiting approval|No testimonial supplied|approved blue chimney|Format checks do not verify|CVV is not collected|local review database/i;
test('published customer pages contain no internal review artifacts',()=>{
 for(const file of ['pages/Home.jsx','pages/Reviews.jsx','pages/FAQ.jsx','pages/legal/PrivacyPolicy.jsx','pages/legal/TermsOfService.jsx','pages/legal/FCRARights.jsx','pages/legal/CROADisclosure.jsx','components/Navbar.jsx','components/Footer.jsx','pages/NotFound.jsx','pages/ContractSigning.jsx'])assert.doesNotMatch(render(file),internal,file);
 for(const name of ['Articles','Resources','CreditScore','ClientLogin'])assert.doesNotMatch(render('pages/PublicResources.jsx',name),internal,name);
});
test('reviews show an honest customer empty state without fabricated testimonials or empty design cards',()=>{
 const html=render('pages/Reviews.jsx');
 assert.doesNotMatch(html,/hrs-voice-space|hrs-voices-preview|Customer’s own words|Room for 20/);
 assert.match(html,/No customer reviews to share yet/);
 assert.match(html,/href="\/get-started"/);
});
test('privacy and search metadata match live card collection',async()=>{
 const html=render('pages/legal/PrivacyPolicy.jsx');
 assert.match(html,/cardholder name, card number, expiration date and billing address/i);
 assert.doesNotMatch(html,/Do not submit card information.*enrollment form/);
 const {PUBLIC_PAGES,renderHead}=await import('../shared/public-pages.js');
 assert.doesNotMatch(PUBLIC_PAGES['/get-started'].description,/No card details/);
 assert.doesNotMatch(renderHead('/'),internal);
});

const {ui,walk,text,click,fill,readyCardPreview}=require('./enrollment-copy-ui.cjs');
test('live-capability enrollment steps and confirmation use customer language',async()=>{
 const h=ui(undefined,{ok:true,capability:{enabled:true,syntheticOnly:false,securityCodeRequired:true},data:{billingMode:'manual',status:'pending_manual_review',requestId:'FICTIONAL_REFERENCE',cardSaved:true}});
 h.render();h.effects[0]();await new Promise(setImmediate);
 assert.doesNotMatch(text(h.render()),internal);
 readyCardPreview(h);assert.doesNotMatch(text(h.render()),internal);click(h,'Next');
 let tree=h.render();assert.doesNotMatch(text(tree),internal);
 for(const label of ['Cardholder name','Card number','Expiry (MM/YY)'])assert.ok(walk(tree).some(n=>n.type==='label'&&text(n)===label));
 for(const [k,v]of Object.entries({billingAddressLine1:'100 Example Way',billingCity:'Austin',billingState:'TX',billingZip:'78701','demoCard-name':'Fictional Example','demoCard-number':'4111111111111111','demoCard-expiry':'12/99','card-cvv':'627'}))fill(h,k,v);
 const submit=walk(h.render()).find(n=>n.type==='button'&&/Save enrollment/.test(text(n)));assert.ok(submit);
 submit.props.onClick();await new Promise(setImmediate);
 assert.match(text(h.render()),/Your enrollment request has been received/);assert.doesNotMatch(text(h.render()),internal);
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,'/api/enroll');assert.equal(h.calls[0].body.card.number,'4111111111111111');
});

test('all route metadata and every article detail are free of internal process copy',async()=>{
 const {PUBLIC_PAGES,renderHead}=await import('../shared/public-pages.js');
 for(const route of Object.keys(PUBLIC_PAGES)){
  assert.doesNotMatch(renderHead(route),internal,route);
  if(route.startsWith('/articles/'))assert.doesNotMatch(render('pages/PublicResources.jsx','ArticleDetail',route),internal,route);
 }
});

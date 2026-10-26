import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileSearch, MessageCircle, ListChecks, Home as HomeIcon, Shield } from 'lucide-react';
import articles from '../../shared/editorial-articles';

const consultationEmail = 'mailto:help@homereadyscores.com?subject=Free%20credit%20consultation%20request';
const Start = ({ secondary = false }) => <Link to="/get-started" className={`hrs-button ${secondary ? 'hrs-button-outline' : ''}`}>Get Started Now <ArrowRight size={18} aria-hidden="true" /></Link>;
const services = [
  [MessageCircle, 'A conversation about your goals', 'Start with the credit concerns standing between you and your homebuying plans. Ask questions in a free credit consultation.'],
  [FileSearch, 'A closer look at your report', 'Discuss entries you believe may be inaccurate, incomplete or unfamiliar, and the records that may help explain them.'],
  [ListChecks, 'Understand your options', 'Talk through the credit-repair process, dispute questions and the proposed service before deciding to move forward.'],
  [HomeIcon, 'Keep homeownership in view', 'Use practical credit education to prepare questions about payment habits, balances and your next conversation with a lender.'],
];
const concerns = ['Collections', 'Late payments', 'Medical accounts', 'Repossessions', 'Bankruptcy entries', 'Student loan entries', 'Unfamiliar accounts', 'Credit-report errors'];

export default function Home() {
  return <div className="hrs-home hrs-familiar-home">
    <section className="hrs-familiar-hero">
      <div className="hrs-wrap hrs-familiar-hero-grid">
        <div className="hrs-familiar-hero-copy">
          <p className="hrs-pill"><Shield size={15} aria-hidden="true" />Your credit. Your home. Your future.</p>
          <h1>Don’t let<br /><span className="hrs-gradient-text">bad credit</span><br />put your home<br />plans on hold.</h1>
          <p>Take the first step toward addressing your credit concerns with HomeReady Scores. Understand your options and choose how to get started.</p>
          <div className="hrs-actions"><Start /><a className="hrs-button hrs-button-outline" href="#services">Learn More <ArrowRight size={18} aria-hidden="true" /></a></div>
          <p className="hrs-hero-note">You will not be charged when you submit your enrollment request.</p>
        </div>
        <div className="hrs-familiar-visual">
          <aside className="hrs-goals-card" aria-label="Credit concerns you can ask about">
            <h2>Topics You Can Ask About:</h2>
            <ul className="hrs-topic-list">{concerns.map(concern => <li key={concern}><CheckCircle size={19} aria-hidden="true" /><span>{concern}</span></li>)}</ul>
            <p>Bring your questions. Start with a free credit consultation.</p>
          </aside>
          <Link className="hrs-next-step-badge" to="/get-started"><span className="hrs-next-step-icon"><Shield size={28} aria-hidden="true" /></span><span><small>Next step</small>Get Started<br />Now <ArrowRight size={17} aria-hidden="true" /></span></Link>
        </div>
      </div>
    </section>

    <section className="hrs-goals-band"><div className="hrs-wrap">
      <h2>Your home plans deserve a next step.</h2>
      <p>HomeReady Scores gives you a place to start: discuss your concerns, learn about credit repair and review your options.</p>
      <a className="hrs-text-link" href={consultationEmail}>Request a free credit consultation <ArrowRight size={17} aria-hidden="true" /></a>
      <p className="hrs-small">Request a time to discuss your credit concerns.</p>
    </div></section>

    <section className="hrs-section" id="services"><div className="hrs-wrap">
      <div className="hrs-section-heading"><p className="hrs-kicker">Credit repair starts with understanding</p><h2>Support for <span className="hrs-gradient-text">your next move.</span></h2><p>A home is a big goal. Begin with a clearer understanding of your credit concerns and the steps you can discuss with our team.</p></div>
      <div className="hrs-service-grid">{services.map(([Icon, title, copy]) => <article className="hrs-familiar-card" key={title}><div className="hrs-card-icon">{createElement(Icon, { size: 34, strokeWidth: 1.7, 'aria-hidden': true })}</div><h3>{title}</h3><p>{copy}</p><Link className="hrs-text-link" to="/get-started">Get Started Now <ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div>
    </div></section>

    <section className="hrs-section hrs-home-plans" id="plans"><div className="hrs-wrap">
      <div className="hrs-section-heading"><p className="hrs-kicker">Pricing</p><h2>Choose your <span className="hrs-gradient-text">enrollment option.</span></h2><p>For yourself or for you and your partner. Review the initial fee and ongoing price together.</p></div>
      <div className="hrs-pricing-grid">{[['Single', 'For one person', '189.99', '100.00'], ['Couple', 'For you and your spouse or partner', '379.99', '160.00']].map(([name, description, initial, monthly]) => <article className="hrs-price-card" key={name}>
        <p className="hrs-kicker">{name}</p><h3>{description}</h3><div className="hrs-price"><strong>${monthly}</strong><span>/ month</span></div>
        <p className="hrs-monthly"><strong>${initial} initial fee</strong><br />Monthly pricing starts 30 days after signup.</p>
        <ul className="hrs-check-list"><li><CheckCircle size={18} aria-hidden="true" />{name === 'Single' ? 'Individual enrollment' : 'Enrollment for you and your partner'}</li><li><CheckCircle size={18} aria-hidden="true" />Share your credit concerns and goals</li><li><CheckCircle size={18} aria-hidden="true" />Review the service agreement before moving forward</li><li><CheckCircle size={18} aria-hidden="true" />Keep your enrollment reference for follow-up</li></ul>
        <Start /><p className="hrs-small">You will not be charged when you submit your enrollment request.</p>
      </article>)}</div>
      <p className="hrs-pricing-note">Have questions first? <a href={consultationEmail}>Request a free credit consultation by email.</a> A request is not a booked appointment.</p>
    </div></section>

    <section className="hrs-section hrs-home-articles" id="articles"><div className="hrs-wrap">
      <div className="hrs-articles-heading"><div><p className="hrs-kicker">Articles</p><h2>Get informed.<br /><span className="hrs-gradient-text">Get prepared.</span></h2></div><Link className="hrs-text-link" to="/articles">View all articles <ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="hrs-home-article-grid">{articles.slice(0, 3).map((article, index) => <article className="hrs-familiar-card" key={article.slug}>
        <div className="hrs-card-icon" aria-hidden="true">{createElement([FileSearch, ListChecks, HomeIcon][index], { size: 34, strokeWidth: 1.7 })}</div>
        <p className="hrs-editorial-meta">{article.category} · {article.readingMinutes} min read</p>
        <h3><Link to={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p>
        <Link className="hrs-text-link" to={`/articles/${article.slug}`}>Read article <ArrowRight size={16} aria-hidden="true" /><span className="hrs-visually-hidden">: {article.title}</span></Link>
      </article>)}</div>
    </div></section>

    <section className="hrs-section hrs-home-contact" id="contact"><div className="hrs-wrap"><div className="hrs-journey-card">
      <div><p className="hrs-kicker">Your next step</p><h2>Ready to start your <span>HomeReady journey?</span></h2><p>Ask HomeReady Scores about credit repair and the options for getting started. Your free consultation begins with a request to our team.</p><p className="hrs-small">Credit outcomes vary. No score increase, removal, timeline or mortgage approval is guaranteed.</p></div>
      <div className="hrs-journey-actions"><Start /><a className="hrs-consultation-link" href={consultationEmail}>Request a free consultation <ArrowRight size={17} aria-hidden="true" /></a><p>Opens your email app. A request is not a booked appointment. Please keep sensitive financial information out of email.</p></div>
    </div></div></section>
  </div>;
}

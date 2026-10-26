import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, UserRound } from 'lucide-react';
import { approvedReviewPhoto, getPublishableReviews, REVIEW_CAPACITY } from '../../shared/customer-reviews';
import './reviews.css';

const PAGE_SIZE = 6;

function ReviewCard({ review }) {
  const photo = approvedReviewPhoto(review.photo);
  return (
    <article className="hrs-voice-card">
      <Quote className="hrs-voice-quote-icon" size={28} strokeWidth={1.5} aria-hidden="true" />
      <blockquote><p>{review.quote}</p></blockquote>
      <footer className="hrs-voice-person">
        {photo ? <img className="hrs-voice-avatar" src={photo} alt={`Portrait of ${review.displayName}`} width="56" height="56" loading="lazy" /> :
          <span className="hrs-voice-avatar" aria-hidden="true"><UserRound size={26} strokeWidth={1.4} /></span>}
        <div><h3>{review.displayName}</h3><a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">{review.sourceLabel}<span className="sr-only"> (opens in a new tab)</span><ArrowRight size={14} aria-hidden="true" /></a></div>
      </footer>
    </article>
  );
}

function ReviewSpace({ number }) {
  return (
    <article className="hrs-voice-card hrs-voice-space" aria-label={`Review layout space ${number}; not a customer testimonial`}>
      <div className="hrs-voice-space-top"><span>Review space {String(number).padStart(2, '0')}</span><Quote size={24} strokeWidth={1.4} aria-hidden="true" /></div>
      <div className="hrs-voice-lines" aria-hidden="true"><span /><span /><span /></div>
      <div className="hrs-voice-person">
        <span className="hrs-voice-avatar" aria-hidden="true"><UserRound size={26} strokeWidth={1.4} /></span>
        <div><h3>Customer’s own words</h3><p>Review and photo awaiting approval</p></div>
      </div>
      <p className="hrs-voice-placeholder-label">Layout preview · No testimonial supplied</p>
    </article>
  );
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const reviews = getPublishableReviews();
  const spaces = Array.from({ length: REVIEW_CAPACITY - reviews.length }, (_, index) => ({ slot: reviews.length + index + 1 }));
  const entries = [...reviews.map(review => ({ review })), ...spaces];
  const visible = entries.slice(0, visibleCount);
  const pending = REVIEW_CAPACITY - reviews.length;

  return (
    <div className="hrs-content-page hrs-reviews-page hrs-voices">
      <section className="hrs-wrap hrs-voices-intro">
        <div><p className="hrs-kicker">Customer reviews</p><h1>Real experiences.<br />Shared in their own words.</h1><p>Learn about HomeReady Scores through the people who have worked with us. Customer reviews appear here after their source and permission to share have been confirmed.</p></div>
        {pending > 0 && <aside className="hrs-voices-preview" aria-label="Review page preparation status"><span className="hrs-voices-preview-label">Unpublished design preview</span><h2>Room for 20 customer stories.</h2><p>{reviews.length === 0 ? 'Customer reviews and photos have not been approved for this preview yet.' : `${reviews.length} approved ${reviews.length === 1 ? 'review' : 'reviews'}; ${pending} review spaces awaiting approval.`}</p><p>Empty spaces show the layout only. They are not customer testimonials.</p></aside>}
      </section>

      <section className="hrs-wrap hrs-voices-collection" aria-labelledby="hrs-voices-heading">
        <div className="hrs-voices-collection-heading"><h2 id="hrs-voices-heading">Customer voices</h2><p>{reviews.length > 0 ? `${reviews.length} approved ${reviews.length === 1 ? 'review' : 'reviews'}` : 'Awaiting verified customer reviews'}</p></div>
        <div className="hrs-voices-grid" id="hrs-voices-list">{visible.map(entry => entry.review ? <ReviewCard key={entry.review.id} review={entry.review} /> : <ReviewSpace key={`space-${entry.slot}`} number={entry.slot} />)}</div>
        <div className="hrs-voices-more"><p role="status" aria-live="polite">Showing {visible.length} of {REVIEW_CAPACITY} {pending > 0 ? 'review layout spaces' : 'reviews'}.</p>{visibleCount < entries.length && <button type="button" className="hrs-button hrs-button-outline" aria-controls="hrs-voices-list" onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, entries.length))}>Show more {pending > 0 ? 'review spaces' : 'reviews'}<ArrowRight size={16} aria-hidden="true" /></button>}</div>
        <p className="hrs-voices-disclosure">Individual experiences vary. A customer review does not guarantee a credit score change, item removal, timeline or mortgage approval.</p>
      </section>

      <section className="hrs-voices-cta"><div className="hrs-wrap"><div><p className="hrs-kicker">Your next step</p><h2>Credit questions holding up your next move?</h2><p>Tell us about your credit goals and request a review of your next steps.</p></div><Link className="hrs-button" to="/get-started">Get Started Now<ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, UserRound } from 'lucide-react';
import { approvedReviewPhoto, getPublishableReviews } from '../../shared/customer-reviews';
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

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const reviews = getPublishableReviews();
  const visible = reviews.slice(0, visibleCount);

  return (
    <div className="hrs-content-page hrs-reviews-page hrs-voices">
      <section className="hrs-wrap hrs-voices-intro">
        <div><p className="hrs-kicker">Customer reviews</p><h1>Real experiences.<br />Shared in their own words.</h1><p>Learn about HomeReady Scores through the people who have worked with us. </p></div>

      </section>

      <section className="hrs-wrap hrs-voices-collection" aria-labelledby="hrs-voices-heading">
        <div className="hrs-voices-collection-heading"><h2 id="hrs-voices-heading">Customer voices</h2></div>
        {reviews.length === 0 ? <div className="hrs-voice-card"><h3>No customer reviews to share yet.</h3><p>Have questions about getting started? Talk with our team about your credit concerns and enrollment options.</p></div> : <>
          <div className="hrs-voices-grid" id="hrs-voices-list">{visible.map(review => <ReviewCard key={review.id} review={review} />)}</div>
          <div className="hrs-voices-more"><p role="status" aria-live="polite">Showing {visible.length} of {reviews.length} reviews.</p>{visibleCount < reviews.length && <button type="button" className="hrs-button hrs-button-outline" aria-controls="hrs-voices-list" onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, reviews.length))}>Show more reviews<ArrowRight size={16} aria-hidden="true" /></button>}</div>
        </>}
        <p className="hrs-voices-disclosure">Individual experiences vary. A customer review does not guarantee a credit score change, item removal, timeline or mortgage approval.</p>
      </section>

      <section className="hrs-voices-cta"><div className="hrs-wrap"><div><p className="hrs-kicker">Your next step</p><h2>Credit questions holding up your next move?</h2><p>Tell us about your credit goals and request a review of your next steps.</p></div><Link className="hrs-button" to="/get-started">Get Started Now<ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </div>
  );
}

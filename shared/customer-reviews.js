// Public display data only. Keep source/permission evidence in the private project
// intake ledger, then explicitly approve each record before adding it here.
// No customer reviews or customer portraits have been verified for this preview.
export const REVIEW_CAPACITY = 20;
export const customerReviews = [];

export function getPublishableReviews(records = customerReviews) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.filter(review => {
    if (!review || review.reviewApproved !== true ||
      ![review.id, review.quote, review.displayName, review.sourceLabel].every(value => typeof value === 'string' && value.trim())) return false;
    try {
      const source = new URL(review.sourceUrl);
      if (source.protocol !== 'https:' || source.username || source.password || seen.has(review.id)) return false;
    } catch { return false; }
    seen.add(review.id);
    return true;
  }).slice(0, REVIEW_CAPACITY);
}

export function approvedReviewPhoto(photo) {
  if (photo?.approved !== true || photo?.subjectConfirmed !== true ||
    typeof photo.src !== 'string' || !/^\/images\/customer-reviews\/[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)$/.test(photo.src)) return null;
  return photo.src;
}

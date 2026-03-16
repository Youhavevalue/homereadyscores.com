import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reviews = () => {
  const reviews = [
    {
      name: 'Ralph E.',
      score: '+114 Pts',
      image: 'https://i.pravatar.cc/150?u=12',
      content: 'Home Ready Scores removed 7 negative items in just 45 days. I was finally able to qualify for my first home at a 4.2% interest rate. They changed my family\'s life.',
      type: 'Homeowner'
    },
    {
      name: 'Sarah M.',
      score: '+82 Pts',
      image: 'https://i.pravatar.cc/150?u=15',
      content: 'I had identity theft issues that stayed on my report for years. They cleared them up in two months. Highly professional team.',
      type: 'Car Loan'
    },
    {
      name: 'David K.',
      score: '+95 Pts',
      image: 'https://i.pravatar.cc/150?u=18',
      content: 'The tracking app they provide is amazing. I could see exactly what letters were being sent and when removals happened.',
      type: 'Refinance'
    },
    {
      name: 'Maria L.',
      score: '+127 Pts',
      image: 'https://i.pravatar.cc/150?u=22',
      content: 'Best investment I ever made. My score went from 540 to 667 in less than three months. Now I have a business line of credit.',
      type: 'Entrepreneur'
    },
    {
      name: 'James P.',
      score: '+76 Pts',
      image: 'https://i.pravatar.cc/150?u=33',
      content: 'Cleaned up medical bills that were hurting my score. The process was hands-off and very well managed.',
      type: 'Medical Debt'
    },
    {
      name: 'Linda G.',
      score: '+103 Pts',
      image: 'https://i.pravatar.cc/150?u=44',
      content: 'They were able to remove a bankruptcy from 5 years ago. I didn\'t think it was possible. Lifetime customer!',
      type: 'Post-Bankruptcy'
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-surface">
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid lg:grid-cols-2 gap-20 items-end">
           <div className="animate-slide-up">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-6">
                Client Success Stories
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-navy">
                Proof You Can Reach Your <span className="text-primary italic">Home Goals.</span>
              </h1>
           </div>
           <div className="bg-white p-10 rounded-3xl shadow-xl shadow-navy/5 border border-gray-100 animate-fade-in">
              <div className="flex items-center gap-4 mb-4">
                 <div className="flex text-yellow-500 gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="currentColor" />)}
                 </div>
                 <span className="text-2xl font-black text-navy italic">4.9/5</span>
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Based on 2,500+ Honest Reviews</p>
           </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {reviews.map((review, i) => (
               <div key={i} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 relative hover:-translate-y-2 transition-all duration-500 group animate-slide-up" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="absolute top-8 right-10 text-primary/5 group-hover:text-primary/10 transition-colors">
                     <Quote size={80} fill="currentColor" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                     <img src={review.image} className="w-16 h-16 rounded-2xl grayscale hover:grayscale-0 transition-all shadow-lg" alt={review.name} />
                     <div>
                        <h4 className="text-xl font-black text-navy">{review.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{review.type}</p>
                     </div>
                  </div>

                  <p className="text-gray-600 font-medium leading-relaxed mb-10 relative z-10">
                     "{review.content}"
                  </p>

                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex text-yellow-500 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                     </div>
                     <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle size={14} />
                        {review.score}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <section className="mt-24 max-w-4xl mx-auto px-6">
         <div className="bg-navy rounded-[40px] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
            <h2 className="text-3xl md:text-4xl font-black mb-8 relative z-10 italic">Ready to be our next success?</h2>
            <Link to="/get-started" className="auth-button min-w-[280px] mx-auto relative z-10 group inline-block">
               Get Started
            </Link>
         </div>
      </section>
    </div>
  );
};

export default Reviews;

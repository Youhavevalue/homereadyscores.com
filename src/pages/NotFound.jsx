import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="pt-40 pb-24 px-6 max-w-3xl mx-auto"><h1 className="text-4xl font-black mb-6">Page not found</h1><p className="mb-8">This address is unavailable. You can return to the website or start your enrollment.</p><div className="flex flex-wrap gap-4"><Link to="/" className="secondary-button">Back to home</Link><Link to="/get-started" className="auth-button">Get Started Now</Link></div></section>;
}

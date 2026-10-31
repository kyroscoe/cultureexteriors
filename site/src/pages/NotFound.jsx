import { Button } from '../components/Shared';

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">404 / Page not found</span>
        <h1>That page isn’t here.</h1>
        <p>Return to our homepage or get in touch to tell us about your project.</p>
        <Button href="/">Return Home</Button> <Button className="dark-outline">Contact Us</Button>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';

export default function About() {
  const values = [
    ['cash', 'Pay on delivery', 'No cards and no online payment. You pay in cash when your order reaches you.'],
    ['tag', 'Clear pricing', 'Prices, discounts and delivery charges are shown before you place an order.'],
    ['mail', 'Real support', 'Every email to shaupex@gmail.com is read by a real person.'],
  ];
  const steps = [
    ['Browse', 'Explore categories, search, or check the sale section.'],
    ['Order', 'Add items to your cart, enter your address and phone, and place the order.'],
    ['Receive and pay', 'Your order arrives at your door. Pay the rider in cash.'],
  ];
  return (
    <>
      <section className="page-hero"><div className="container">
        <h1>About shaupex</h1>
        <p>A simple online store built around easy, honest shopping.</p>
      </div></section>

      <div className="container section">
        <Reveal className="about-intro">
          <div>
            <h2>Who we are</h2>
            <p>shaupex is an online store where you can find beauty products, fashion, electronics, home items and more in one place.</p>
            <p>We keep shopping simple. Pick what you like, add it to your cart, and pay with cash when it arrives. There is nothing to set up and nothing to pay upfront.</p>
          </div>
          <div className="about-card"><Icon name="store" size={42} /><strong>One store, many categories</strong><small>New products are added regularly.</small></div>
        </Reveal>

        <Reveal className="section-sm">
          <h2>What we care about</h2>
          <div className="cards3">
            {values.map(([ic, t, d]) => (
              <div className="icard" key={t}><span className="trust-ic"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </Reveal>

        <Reveal className="section-sm">
          <h2>How it works</h2>
          <div className="cards3">
            {steps.map(([t, d], i) => (
              <div className="icard step" key={t}><span className="stepno">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </Reveal>

        <Reveal className="section-sm">
          <div className="cta">
            <div><h2>Ready to start?</h2><p>Have a question first? We are happy to help.</p></div>
            <div className="row gap wrap"><Link className="btn btn-lime btn-lg" to="/shop">Shop now</Link><Link className="btn btn-outline-light btn-lg" to="/contact">Contact us</Link></div>
          </div>
        </Reveal>
      </div>
    </>
  );
}

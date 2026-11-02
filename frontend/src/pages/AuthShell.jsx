import Logo from '../components/Logo';
import Icon from '../components/Icon';

export default function AuthShell({ children }) {
  return (
    <div className="container section">
      <div className="auth">
        <div className="auth-side">
          <Logo light />
          <h2>Shop smart. Pay on delivery.</h2>
          <ul>
            <li><Icon name="check" size={18} /> Save your wishlist and cart</li>
            <li><Icon name="check" size={18} /> Track every order in one place</li>
            <li><Icon name="check" size={18} /> Cancel pending orders yourself</li>
          </ul>
        </div>
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}

import { Button, Logo } from './Shared';

export default function Header() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <Button className="light header-estimate" arrow={false} aria-label="Request an Estimate">
            <span>
              <span className="estimate-prefix">Request an </span>Estimate
            </span>
          </Button>
        </div>
      </header>
    </>
  );
}

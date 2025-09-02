import Link from 'next/link';

const { COMPANY_NAME, SITE_NAME } = process.env;

function Icon({ name }: { name: 'pin' | 'phone' | 'mail' | 'insta' | 'fb' | 'yt' | 'pintr' | 'tiktok' }) {
  const common = 'h-4 w-4';
  switch (name) {
    case 'pin':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 016 6c0 4.5-6 10-6 10S4 12.5 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"/></svg>
      );
    case 'phone':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884a2 2 0 011.316-1.878l2.4-.9a2 2 0 012.32.717l1.12 1.493a2 2 0 01-.45 2.807l-.94.705a11.043 11.043 0 005.1 5.1l.706-.94a2 2 0 012.806-.45l1.492 1.12a2 2 0 01.718 2.32l-.9 2.4A2 2 0 0114.116 18C7.94 18 2.998 13.058 2.998 6.883l.005-.999z"/></svg>
      );
    case 'mail':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v.217l-8 5.333-8-5.333V4zm0 2.383V16a2 2 0 002 2h12a2 2 0 002-2V6.383l-7.445 4.966a2 2 0 01-2.11 0L2 6.383z"/></svg>
      );
    case 'insta':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 10.002 2.5 1.25 1.25 0 00-.002-2.5z"/></svg>
      );
    case 'fb':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V8a1 1 0 011-1h3V3h-3a5 5 0 00-5 5v2H6v4h3v8h4z"/></svg>
      );
    case 'yt':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.2 31.2 0 0024 12a31.2 31.2 0 00-.5-5.8zM9.6 15.5V8.5l6.4 3.5-6.4 3.5z"/></svg>
      );
    case 'pintr':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-3.5 19.4c-.1-.8-.2-2 .1-2.9l2-8a3.4 3.4 0 01-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-.9 3.8-.3 1.1.6 2.1 1.7 2.1 2 0 3.5-2.1 3.5-5 0-2.6-1.9-4.5-4.7-4.5-3.2 0-5.1 2.4-5.1 5 0 1 .4 2.1 1 2.7.1.1.1.2.1.4l-.4 1.6c0 .2-.2.3-.4.2-1.4-.6-2.3-2.5-2.3-4 0-3.3 2.4-6.4 7-6.4 3.7 0 6.6 2.6 6.6 6.1 0 3.7-2.4 6.7-5.7 6.7-1.1 0-2.1-.6-2.5-1.3l-.7 2.8c-.3 1.1-1 2.6-1.4 3.5 1 .3 2 .5 3 .5 5.9 0 10-4.3 10-10S17.9 2 12 2z"/></svg>
      );
    case 'tiktok':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M16 2h3a6 6 0 01-6-6v3a9 9 0 009 9V5a12 12 0 01-6-3v11a5 5 0 11-5-5 5 5 0 010 10 8 8 0 008-8V2z"/></svg>
      );
  }
}

function PaymentIcons() {
  const icon = 'h-6 w-auto rounded border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={icon}>VISA</span>
      <span className={icon}>MASTERCARD</span>
      <span className={icon}>AMEX</span>
      <span className={icon}>DISCOVER</span>
      <span className={icon}>UNIONPAY</span>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
  const copyrightName = COMPANY_NAME || SITE_NAME || '';

  const footerMenu = [
    { title: 'Search', href: '/search' },
    { title: 'About Us', href: '/about' },
    { title: 'FAQs', href: '/faq' },
    { title: 'Contact Us', href: '/contact' },
    { title: 'Shipping Policy', href: '/policies/shipping' },
    { title: 'Refund Policy', href: '/policies/refund' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Store Locator', href: '/stores' },
    { title: 'Are you an Influencer?', href: '/influencer' },
  ];

  return (
    <footer className="text-sm text-neutral-700 dark:text-neutral-300">
      {/* Upper section */}
      <div className="mx-auto w-full max-w-7xl border-t border-neutral-200 px-6 py-10 md:px-4 min-[1320px]:px-0 dark:border-neutral-700">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Sign up and save */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-500">SIGN UP AND SAVE</h3>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="relative mt-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-3 pr-10 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 dark:border-neutral-700 dark:bg-black"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <Icon name="mail" />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
              <a aria-label="Instagram" href="#" className="hover:text-black dark:hover:text-white"><Icon name="insta" /></a>
              <a aria-label="Facebook" href="#" className="hover:text-black dark:hover:text-white"><Icon name="fb" /></a>
              <a aria-label="YouTube" href="#" className="hover:text-black dark:hover:text-white"><Icon name="yt" /></a>
              <a aria-label="Pinterest" href="#" className="hover:text-black dark:hover:text-white"><Icon name="pintr" /></a>
              <a aria-label="TikTok" href="#" className="hover:text-black dark:hover:text-white"><Icon name="tiktok" /></a>
            </div>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-500">CONTACT US</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2"><span className="mt-0.5 text-neutral-500"><Icon name="pin" /></span> 1235 Commercial, 2nd Floor, Phase 2 DHA, Lahore</li>
              <li className="flex items-center gap-2"><span className="text-neutral-500"><Icon name="phone" /></span> 0311 111 66644</li>
              <li className="flex items-center gap-2"><span className="text-neutral-500"><Icon name="mail" /></span> carecenter@example.com</li>
            </ul>
          </div>

          {/* Footer menu */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-500">FOOTER MENU</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-2">
              {footerMenu.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline">{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle separators and currency */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="text-xs text-neutral-500">🇵🇰 Pakistan (PKR ₨)</div>
          <PaymentIcons />
          <div className="text-xs text-neutral-500">Powered by Next.js</div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-neutral-200 py-6 text-sm dark:border-neutral-700">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <p className="md:ml-auto text-neutral-500">Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}

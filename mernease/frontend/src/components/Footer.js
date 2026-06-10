import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-12 bg-surface dark:bg-on-background border-t border-outline-variant/30 mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
        <div className="space-y-4">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface dark:text-on-surface-variant block">RentEase</span>
          <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed max-w-sm">
            Redefining luxury living for the modern global citizen through curated stays and seamless management.
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline">
            © 2024 RentEase Premium Hospitality. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
          <a className="font-label-md text-label-md text-on-surface-variant dark:text-outline hover:text-primary transition-colors hover:underline" href="#">About Us</a>
          <a className="font-label-md text-label-md text-on-surface-variant dark:text-outline hover:text-primary transition-colors hover:underline" href="#">Terms</a>
          <a className="font-label-md text-label-md text-on-surface-variant dark:text-outline hover:text-primary transition-colors hover:underline" href="#">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
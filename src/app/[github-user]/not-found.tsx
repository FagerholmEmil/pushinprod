'use client';

import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className={buttonVariants()}>
        Go back to the homepage
        <ExternalLink className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
};

export default NotFoundPage;

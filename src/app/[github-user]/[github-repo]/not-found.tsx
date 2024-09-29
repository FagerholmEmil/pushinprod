'use client';

import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useParams } from 'next/navigation';

const NotFoundPage: React.FC = () => {
  const params = useParams();
  console.log(params);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-4">Could not find the repository</p>
      <Link
        href={`/?githubUser=${params['github-user']}&githubRepo=${params['github-repo']}`}
        className={buttonVariants()}
      >
        Lets add it!
        <ExternalLink className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
};

export default NotFoundPage;

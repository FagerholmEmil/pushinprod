'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { Suspense, useState } from 'react';
import { cloneRepo } from './actions_2';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const Home: React.FC = () => {
  const searchParams = useSearchParams();

  const [repo, setRepo] = useState(() => {
    if (searchParams.get('githubUser') && searchParams.get('githubRepo')) {
      return `${searchParams.get('githubUser')}/${searchParams.get('githubRepo')}`;
    }

    return '';
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCloneRepo = async () => {
    setLoading(true);
    try {
      const res = await cloneRepo(repo);

      if (res.success) {
        toast('Success!', {
          description: 'Successfully cloned repo',
        });
        router.push(`/${repo}`);
      } else {
        if (res.is404) {
          toast('404', {
            description:
              'Repository not found on GitHub. Make sure you spelled it correctly.',
          });
        } else {
          toast('Error!', {
            description: res.message,
          });
        }
      }
    } catch (error) {
      console.error('Error cloning repo:', error);
      toast('Error!', {
        description: 'Error cloning repo',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen p-4 h-screen relative flex justify-center items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-5xl font-black text-center mb-10 font-serif italic">
          Pushin-p<span className="text-theme">(rod)</span>
        </h1>

        <div className="animate-blur-bounce absolute -top-5 left-0 w-52 rounded-br-full h-52 bg-gradient-to-tr from-indigo-700 to-rose-600 blur-2xl"></div>
        <div className="animate-blur-bounce absolute -top-5 -right-5 w-40 h-40 bg-theme blur-2xl"></div>
        <div className="animate-blur-bounce absolute bottom-0 right-0 w-40 h-40 bg-[#e29578] blur-2xl"></div>
        <div className="animate-blur-bounce absolute -bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-amber-400 to-green-700 blur-2xl"></div>

        <Input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="Example: FagerholmEmil/pushinprod"
          className="relative w-full justify-start mb-4 rounded-[0.5rem] bg-muted/50 text-sm font-normal shadow-none"
        />

        <Button disabled={!repo || loading} onClick={handleCloneRepo}>
          {loading ? (
            <>
              <Spinner size={16} className="mr-1" />
              Getting data
            </>
          ) : (
            'Open repo'
          )}
        </Button>
      </div>
    </div>
  );
};

const HomeSuspense = () => {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
};
export default HomeSuspense;

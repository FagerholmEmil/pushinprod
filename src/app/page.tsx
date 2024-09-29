'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
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
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-5xl text-center mb-10 font-light italic">
          Pushin-p<span className="text-blue-500">(rod)</span>
        </h1>

        <Input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="FagerholmEmil/pushinprod..."
          className="relative w-full justify-start mb-4 rounded-[0.5rem] bg-muted/50 text-sm font-normal shadow-none"
        />

        <Button disabled={!repo || loading} onClick={handleCloneRepo}>
          {loading ? (
            <>
              <Spinner size={16} className="mr-1" />
              Getting data
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Home;

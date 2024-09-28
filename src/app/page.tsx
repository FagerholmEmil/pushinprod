'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { cloneRepo } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const [repo, setRepo] = useState('');
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
        toast('Error!', {
          description: 'Error cloning repo',
        });
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
          placeholder="imMatheus/vercel-ui..."
          className="relative w-full justify-start mb-4 rounded-[0.5rem] bg-muted/50 text-sm font-normal shadow-none"
        />

        <Button disabled={!repo || loading} onClick={handleCloneRepo}>
          {loading ? 'Loading...' : 'Search'}
        </Button>
      </div>
    </div>
  );
};

export default Home;

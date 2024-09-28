import {
  Go,
  HTML5,
  CSS,
  JavaScript,
  ReactIcon,
  GraphQL,
  TypeScript,
  Sass,
} from '@/components/logos';
import { FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function getLogo(file: string, size: 'md' | 'lg' = 'md') {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3 w-3';

  if (file.endsWith('.tsx'))
    return <ReactIcon className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.ts'))
    return <TypeScript className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'))
    return <JavaScript className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.jsx'))
    return <JavaScript className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.html'))
    return <HTML5 className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.css')) return <CSS className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.scss') || file.endsWith('.sass'))
    return <Sass className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.go')) return <Go className={cn(sizeClass, 'mr-2')} />;
  if (file.endsWith('.gql') || file.endsWith('.graphql'))
    return <GraphQL className={cn(sizeClass, 'mr-2')} />;

  return <FileCode className={cn(sizeClass, 'mr-2')} />;
}

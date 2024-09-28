import { createAI } from 'ai/rsc';
import { submitMessage } from '@/app/actions';

export const AI = createAI({
  initialAIState: {},
  initialUIState: {},
  actions: {
    submitMessage,
  },
});

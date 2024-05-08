'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import axios from 'axios';


const generateSemantics = async (query : string) => {
    const res = await axios.post(
        "https://api.trieve.ai/api/chunk/search",
        {
            "date_bias": true,
            "query": `${query}`,
            "search_type": "hybrid",
            "highlight_results" : true,
            "use_weights" : true
        },
        {
            headers: {
                "TR-Organization": process.env.TRIEVE_ORG_ID || "",
                "TR-Dataset": process.env.TRIEVE_DATASET_ID || "",
                "Authorization": process.env.TRIEVE_API_KEY || "",
              },
        }
    );

    let chunkCount  = 0;
    let context = "";

    const {score_chunks} = await res.data;
    score_chunks.sort((a:any,b:any) => b.score - a.score);

    for(const chunk  in score_chunks) {

            context += `${score_chunks[chunk].metadata[0].chunk_html} \n\n\n`;
            chunkCount++;

            if(chunkCount > 5) break;
    }

    return context

};

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue('');
    const context = generateSemantics(input.trim());


  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: "You are a helpful AI search assistant for IISER Bhopal(a university) students. Use the following pieces of context to answer the question at the end. If answer isn't in the context, say that you don't know, don't try to make up an answer. ANSWER IN BULLET POINTS!.",
      messages: [
        { role: "user", content: `Context: ${context}` },
        { role: "user", content: `Question: ${input}` },
      ],
      maxTokens: 256,
      temperature: 0.7
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { reponse: stream.value };
}
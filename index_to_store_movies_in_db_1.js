import { openai, supabase } from './config.js';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/* Split movies.txt into text chunks.
Return LangChain's "output" – the array of Document objects. */
async function splitDocument(document) {
  const response = await fetch(document);
  const text = await response.text();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 35,
  });
  const output = await splitter.createDocuments([text]);
  return output;
}

/* Create an embedding from each text chunk.
Store all embeddings and corresponding text in Supabase. */
async function createAndStoreEmbeddings() {
  const chunkData = await splitDocument("movies.txt");
  const data = await Promise.all(
    chunkData.map(async (chunk) => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.pageContent
      });
      return { 
        content: chunk.pageContent, 
        embedding: embeddingResponse.data[0].embedding 
      }
    })
  );
  await supabase.from('movies').insert(data);
  console.log(data);
}
createAndStoreEmbeddings();
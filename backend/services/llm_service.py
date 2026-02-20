import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY not found. AI features will not work.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            self.model = "mixtral-8x7b-32768"

    def _generate_response(self, prompt):
        if not self.client:
            return "AI service is not configured (missing API key)."
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {e}")
            return "I'm having trouble connecting to the AI right now. Please try again later."

    def summarize_text(self, text):
        prompt = f"Please provide a concise summary of the following text:\n\n{text}"
        return self._generate_response(prompt)

    def answer_question(self, context, question):
        if context:
            prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer the question based on the context provided. If the answer is not in the context, use your general knowledge."
        else:
            prompt = f"Question: {question}\n\nAnswer the question clearly and concisely."
            
        return self._generate_response(prompt)

    def compare_papers(self, papers_content):
        combined_text = "\n\n---\n\n".join(papers_content)
        prompt = f"Compare the following papers (separated by ---) and highlight key similarities and differences:\n\n{combined_text}"
        return self._generate_response(prompt)

    def generate_insight(self, topic):
        prompt = f"Provide a key research insight or trend regarding: {topic}"
        return self._generate_response(prompt)

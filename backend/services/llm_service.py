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
            self.model = "llama-3.3-70b-versatile"
            self.system_prompt = (
                "You are an advanced AI assistant developed by the 'Zencoders AI Team' from BEC (Bapatla Engineering College). "
                "Your primary goal is to assist users with their queries, research, and analysis tasks. "
                "If asked about your identity, creation, or origin, you must always state that you were developed by the Zencoders AI Team from BEC. "
                "You are helpful, professional, and knowledgeable."
            )

    def _generate_response(self, prompt):
        if not self.client:
            return "AI service is not configured (missing API key)."
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
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

    def generate_response_stream(self, prompt):
        if not self.client:
            yield "AI service is not configured (missing API key)."
            return

        try:
            stream = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                stream=True,
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Groq Stream Error: {e}")
            yield f"Error: {str(e)}"

    def analyze_image_stream(self, prompt, image_data):
        """
        image_data should be a base64 encoded string or a URL.
        """
        if not self.client:
            yield "AI service is not configured."
            return

        # Use a model capable of vision if available, otherwise fallback or error
        vision_model = "llama-3.2-90b-vision-preview" 

        try:
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"{image_data}" if image_data.startswith("http") else f"data:image/jpeg;base64,{image_data}"
                            },
                        },
                    ],
                }
            ]
            
            stream = self.client.chat.completions.create(
                model=vision_model,
                messages=messages,
                stream=True,
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Groq Vision Error: {e}")
            yield f"Error analyzing image: {str(e)}"

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

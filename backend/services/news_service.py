from tavily import TavilyClient
import os

class NewsService:
    def __init__(self):
        self.client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    def get_latest_news(self, query):
        try:
            response = self.client.search(query, search_depth="advanced", max_results=5)
            # Simplified structure
            articles = []
            for result in response.get('results', []):
                articles.append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "score": result.get("score")
                })
            return articles
        except Exception as e:
            print(f"Error fetching news: {e}")
            return []

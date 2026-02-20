import os

class SearchService:
    def __init__(self, paper_service=None):
        self.paper_service = paper_service
        # No more heavy model loading or vector DB

    def add_paper(self, filepath):
        # We don't need to index anything for simple keyword search
        # But we return True to keep the API consistent
        return True

    def search(self, query, k=5):
        """
        Simple keyword search over all papers.
        This is much simpler and error-free compared to vector search.
        """
        if not query or not self.paper_service:
            return []

        results = []
        papers = self.paper_service.list_papers()
        
        for filename in papers:
            filepath = self.paper_service.get_paper_path(filename)
            content = self.paper_service.extract_text(filepath)
            
            if content and query.lower() in content.lower():
                # Find the snippet
                idx = content.lower().find(query.lower())
                start = max(0, idx - 100)
                end = min(len(content), idx + 400)
                snippet = content[start:end]
                
                results.append({
                    "source": filename,
                    "content": snippet.strip() + "...",
                    "score": 1.0 # Dummy score
                })
                
                if len(results) >= k:
                    break
        
        return results

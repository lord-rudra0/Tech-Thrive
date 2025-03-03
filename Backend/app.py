        # Get news in simple format
        news_prompt = f'''
Based on these news items about {location}'s forests and environment:
{chr(10).join([f"- {news.get('title', '')}" for news in news_data[:3]])}

Provide a brief, simple summary of the recent news in 2-3 sentences, written in conversational English.
'''
        
        news_summary = model.generate_content(news_prompt)
        
        # Combine analysis and news in plain text
        complete_text = f'''
{ai_response.text}

Recent News:
{news_summary.text}
''' 
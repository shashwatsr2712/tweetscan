# TweetScan
Analyze tweets by trending hashtags or searched keywords
* This project makes use of `twitter`'s `search/tweets` and `trends/place` APIs to fetch tweets by keywords and get the top trends for a location respectively
* For sentiment analysis, `natural` package is used. After preprocessing (tokenization, stopword removal, spelling correction, and stemming), '`SentimentAnalyzer` from `natural` is used
* Based on the result from `SentimentAnalyzer`, a tweet is categorized as either positive, negative or neutral
* User can either search for a hashtag/keyword or load trend analysis (top 5) of India/World 

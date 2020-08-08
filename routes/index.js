const express=require("express"),
    router=express.Router(),
    Twitter=require("twitter"),
    aposToLexForm=require("apos-to-lex-form"),
    natural=require("natural"),
    SpellCorrector=require("spelling-corrector"),
    stopWord=require("stopword");

// Twitter API credentials
const client=new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_KEY_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

// Modules required for sentiment analysis
const {WordTokenizer}=natural; 
const spellCorrector=new SpellCorrector();
spellCorrector.loadDictionary();
const {SentimentAnalyzer,PorterStemmer}=natural;

// A function which takes a query (containing hashtag/keyword, number of tweets to be fetched, etc.)
// and returns a promise
// This function is used for trend analysis since for each trend, a promise is required and
// results are send to client only after we are done with all promises 
const getTweetsAndCalcSentiments=(query) => {
    return new Promise(function(resolve,reject){
        // Find tweets with this keyword
        client.get('search/tweets', query, function(error, tweets, response) {
            if(error){
                return reject(error);
            } else{
                let len=tweets.statuses.length;
                if(len==0){
                    return resolve({error: 'No Tweets'});
                }
                let tweets_text=[];
                for(let i1=0;i1<len;i1++){
                    if(tweets.statuses[i1].retweeted_status!=undefined){
                        tweets_text.push(tweets.statuses[i1].retweeted_status.full_text);
                    } else{
                        tweets_text.push(tweets.statuses[i1].full_text);
                    }
                }
                let sentiments={Query:query.q,Positive:0,Negative:0,Neutral:0};
                
                // Calculate sentiment of each tweet
                for(let i1=0;i1<tweets_text.length;i1++){
                    let data=tweets_text[i1];
                    // console.log("Original: ");
                    // console.log(data);
            
                    data=aposToLexForm(data).toLowerCase();
                    // console.log("After converting contractions: ");
                    // console.log(data);
            
                    let tokenizer=new WordTokenizer();
                    let tokenized_tweet=tokenizer.tokenize(data);
                    // console.log("After tokenization: ");
                    // console.log(tokenized_tweet);
                    
                    let tokenized_tweet_mod=tokenized_tweet.filter(word => 
                        !word.startsWith("http")
                    );
                    // console.log("After removing links: ");
                    // console.log(tokenized_tweet_mod);
            
                    tokenized_tweet_mod.forEach((word,index) => {
                        tokenized_tweet_mod[index]=word.replace(/[^a-zA-Z\s]+/g, '');
                    });
                    // console.log("Removing Puncts: ");
                    // console.log(tokenized_tweet_mod);
                    
                    tokenized_tweet_mod.forEach((word,index) => {
                        tokenized_tweet_mod[index]=spellCorrector.correct(word);
                    });
                    // console.log("After spell correction: ");
                    // console.log(tokenized_tweet_mod);
                    
                    let tweet_post_sw_removal=stopWord.removeStopwords(tokenized_tweet_mod);
                    // console.log("Removing stopwords: ");
                    // console.log(tweet_post_sw_removal);
                    
                    let sentiment_analyzer=new SentimentAnalyzer('English',PorterStemmer,'afinn');
                    let analysis=sentiment_analyzer.getSentiment(tweet_post_sw_removal);
                    console.log("Final analysis: ");
                    console.log(analysis);
                    console.log("\n");
                    if(analysis<0){
                        sentiments.Negative+=1;
                    } else if(analysis>0){
                        sentiments.Positive+=1;
                    } else{
                        sentiments.Neutral+=1;
                    }
                }
                console.log(sentiments);
                return resolve(sentiments);
            }
        });
    });
}

// Root route
router.get("/",function(req,res){
    res.render("landing");
});

// AJAX search a hashtag/keyword
router.post("/analyzeHashTag",function(req,res){
    let query={
        q: req.body.search,
        count: 100, // Number of tweets to analyze
        lang: 'en',
        tweet_mode: 'extended'
    };

    // Find tweets with this keyword
    client.get('search/tweets', query, function(error, tweets, response) {
        if(error){
            return res.send({error: 'Twitter API Error'});
        } else{
            let len=tweets.statuses.length;
            if(len==0){
                return res.send({error: 'No Tweets'});
            }
            let tweets_text=[];
            for(let i=0;i<len;i++){
                if(tweets.statuses[i].retweeted_status!=undefined){
                    tweets_text.push(tweets.statuses[i].retweeted_status.full_text);
                } else{
                    tweets_text.push(tweets.statuses[i].full_text);
                }
            }
            let sentiments={Positive:0,Negative:0,Neutral:0};

            // Calculate sentiment of each tweet
            for(let i=0;i<tweets_text.length;i++){
                
                let data=tweets_text[i];
                // console.log("Original: ");
                // console.log(data);
        
                data=aposToLexForm(data).toLowerCase();
                // console.log("After converting contractions: ");
                // console.log(data);
        
                let tokenizer=new WordTokenizer();
                let tokenized_tweet=tokenizer.tokenize(data);
                // console.log("After tokenization: ");
                // console.log(tokenized_tweet);
                
                let tokenized_tweet_mod=tokenized_tweet.filter(word => 
                    !word.startsWith("http")
                );
                // console.log("After removing links: ");
                // console.log(tokenized_tweet_mod);
        
                tokenized_tweet_mod.forEach((word,index) => {
                    tokenized_tweet_mod[index]=word.replace(/[^a-zA-Z\s]+/g, '');
                });
                // console.log("Removing Puncts: ");
                // console.log(tokenized_tweet_mod);
                
                tokenized_tweet_mod.forEach((word,index) => {
                    tokenized_tweet_mod[index]=spellCorrector.correct(word);
                });
                // console.log("After spelling correction: ");
                // console.log(tokenized_tweet_mod);
                
                let tweet_post_sw_removal=stopWord.removeStopwords(tokenized_tweet_mod);
                // console.log("Removing stopwords: ");
                // console.log(tweet_post_sw_removal);
                
                let sentiment_analyzer=new SentimentAnalyzer('English',PorterStemmer,'afinn');
                let analysis=sentiment_analyzer.getSentiment(tweet_post_sw_removal);
                console.log("Final analysis "+i);
                console.log(analysis);
                console.log("\n");
                if(analysis<0){
                    sentiments.Negative+=1;
                } else if(analysis>0){
                    sentiments.Positive+=1;
                } else{
                    sentiments.Neutral+=1;
                }
            }
            res.send(sentiments);
        }
    });
});

// AJAX to get top 5 trends in India and analyze tweets for each
router.post("/analyzeIndiaTrends",function(req,res){
    let num_trends=5;
    let trending_keywords=[]; // This contains the top 'num_trends' trends in India
    
    client.get('trends/place',{id: 23424848}, function(error, results, response) {
        let trends=results[0].trends;
        for(let i=0;i<num_trends;i++){
            trending_keywords.push(trends[i].name);
        }
        // Array of promises (for each trend)
        let promises=[];
        for(let i=0;i<num_trends;i++){
            let query={
                q: trending_keywords[i],
                count: 50,
                lang: 'en',
                tweet_mode: 'extended'
            };
            
            // Find tweets with this keyword and calculate sentiment
            promises.push(getTweetsAndCalcSentiments(query));
        }
        // Send result only after all promises are done
        Promise.all(promises).then((data) => {
            res.send(data);
        }).catch(err => {
            res.send({error: "Twitter API error"});
        });
    });
});

// AJAX to get top 5 trends globally and analyze tweets for each
router.post("/analyzeWorldTrends",function(req,res){
    let num_trends=5;
    let trending_keywords=[]; // This contains the top 'num_trends' trends globally
    
    client.get('trends/place',{id: 1}, function(error, results, response) {
        let trends=results[0].trends;
        for(let i=0;i<num_trends;i++){
            trending_keywords.push(trends[i].name);
        }
        // Array of promises (for each trend)
        let promises=[];
        for(let i=0;i<num_trends;i++){
            let query={
                q: trending_keywords[i],
                count: 50,
                lang: 'en',
                tweet_mode: 'extended'
            };
            
            // Find tweets with this keyword and calculate sentiment
            promises.push(getTweetsAndCalcSentiments(query));
        }
        // Send result only after all promises are done
        Promise.all(promises).then((data) => {
            res.send(data);
        }).catch(err => {
            res.send({error: "Twitter API error"});
        });
    });
});

module.exports=router;
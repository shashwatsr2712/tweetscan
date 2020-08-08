const express = require("express"),
    app = express(),
    bodyParser = require("body-parser");

// Requiring routes
const indexRoutes = require("./routes/index");

// Setting up stuff
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// app.use(flash());

// Use all routes
app.use("/", indexRoutes);

// client.get('search/tweets',
//         {q: '#taylorswift',count: 20,lang: 'en',tweet_mode: 'extended'}, function(error, tweets, response) {
//     let len=tweets.statuses.length;
//     console.log(len)
//     for(let i=0;i<len;i++){
//         console.log("TWEET COUNT "+(i+1));
//         if(tweets.statuses[i].retweeted_status!=undefined){
//             console.log(tweets.statuses[i].retweeted_status.full_text);    
//         } else{
//             console.log(tweets.statuses[i].full_text);
//         }
//         console.log("\n")
//     }
// });

// // trending hashtags for a place (using lat and long)
// client.get('trends/closest',{lat: ,long: }, function(error, results, response) {
//     let trends=results[0].trends;
//     for(let i=0;i<trends.length;i++){
//         console.log("COUNT "+i);
//         console.log(trends[i].name);
//         console.log("\n");
//     }
// });

// // trending hashtags for a place (using WOEID; 1 for global)
// client.get('trends/place',{id: 1}, function(error, results, response) {
//     let trends=results[0].trends;
//     for(let i=0;i<trends.length;i++){
//         console.log("COUNT "+i);
//         console.log(trends[i].name);
//         console.log("\n");
//     }
// });

const port=process.env.PORT || 3000;
app.listen(port, function(){
   console.log("TweetScan Server Has Started!");
});
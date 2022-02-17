const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const date = require('date-and-time');
const router = express.Router();
const fetch = require('node-fetch');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
/* python shell */
const {PythonShell} = require('python-shell');

require('dotenv').config();

/*** Use view engine pug */

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

/*** Establish connection to MONGO DB */

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

/*** Define DB Schema */

const newSchema = new mongoose.Schema({
    title: String,
    date: Date,
    text: String,
    positivityScore: Number
});

/*** Define model for news items */

const news = mongoose.model('news', newSchema);

/**** Get Articles from GNews API */

app.get('/getAPIResponse', (request, response) => {
    let url = process.env.URL;
    let newsArticles = [];
    fetch(url)
        .then((response) => {
            return response.json();
            })
        .then((data) =>{
            const newsItems = [... data.articles];
            const numberOfNewsItems = newsItems.length;
            for(let i=0; i<numberOfNewsItems;i++) {
                let title = newsItems[i].title;
                let date = newsItems[i].publishedAt;
                let text = newsItems[i].content;
                newsArticles.push({
                    title: title,
                    date: date,
                    text: text
                })
            }
            return newsArticles;
            })
        .then((newsArticles) => {
            //console.log(newsArticles[0]);
            for(let i=0; i<newsArticles.length; i++){
                let newsPiece = new news();
                newsPiece.title = newsArticles[i].title;
                newsPiece.date = newsArticles[i].date;
                newsPiece.text = newsArticles[i].text;
                let textTest = newsArticles[i].text;
                let articleSentiment = sentiment.analyze(textTest);
                newsPiece.positivityScore = articleSentiment.score;
                newsPiece.save().then(() => console.log("News Item "+i+" has been added from API component."));
            }
        })
    response.render("reroute");
});


/**** When at Home page, render index.pug with the values of the most positive articles from DB. */

app.get("/viewNews", (req, res)=>{
    news.find({positivityScore: {$gt: 30}}, (err, newsItem) => {
        if(!err) {
            const numArticles = newsItem.length;
            let newsArticles = [];
            for(let i=0; i<numArticles; i++){
                var articleTitle = newsItem[i].toObject().title;
                var articleDate = newsItem[i].toObject().date;
                var articleDateFormatted = date.format(articleDate, 'MMMM D, Y HH:MM A');
                var articleText = newsItem[i].toObject().text;
                var articlePositivityScore = newsItem[i].toObject().positivityScore;
                newsArticles.push({
                    articleTitle: articleTitle,
                    articleDate: articleDateFormatted,
                    articleText: articleText,
                    score: articlePositivityScore
                });
            }
            newsArticles.sort( 
                (a,b) => (a.score > b.score) ? -1 : 1
            );
            res.render("index", {
                newsItems: newsArticles
            });
        } else {
        console.log(err);
        res.send("Please investigate the cause behind this error. Check console for error message details.");
        }
    })
});

/* Get articles from Python components */

app.get('/getPythonNews', (req, res) => {
    let options = {
        mode: 'text',
        args: [['title', 'date', 'textParsed']]
      };
      
    PythonShell.run('ParserV1.py', options, function (err, results) {
        
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        let num = 0;
        for(let i =0; i<results.length; i+=4) {
            let newsPiece = new news();
            const title = results[i];
            newsPiece.title = title;
            /* day is not 03 but 3, so needs fix */
            const date = results[i+1];
            newsPiece.date = date;
            let newsText = "";
            let j = 0;
            let counter = 0;
            for(j=i+3; j<results.length;j++) {
                newsText += results[j-1];
                counter++;
                if(/^[A-Z][a-z]* [0-9], [0-9]*$/.test(results[j+1]) || /^[A-Z][a-z]* [0-9][0-9], [0-9]*$/.test(results[j+1])){
                    break;
                }
            }
            if(j<=results.length-1) {i+=counter-2;}
            else{
                for(let k=i+2;k<results.length;k++){
                    newsText+=results[k];
                }
            }
            newsPiece.text = newsText;
            let textTest = newsText;
            let articleSentiment = sentiment.analyze(textTest);
            //console.log(articleSentiment.score);
            newsPiece.positivityScore = articleSentiment.score;
            newsPiece.save().then(() => {num ++; console.log("News Item "+num+" has been added from Python component.")});
            
        }
    });
    res.render("python");
})

/*** HOME PAGE  */

app.get("/", (req, res)=>{
    res.render("home");
});



app.use("/viewNews", router);
app.use("/getAPIResponse", router);
app.use("/", router);

app.listen(process.env.PORT, () => console.log("Listening to port."));






/**** TEST NEWS ARTICLES */
/**** These have been created for testing purposes only - to test connection to DB and filtering. */
/**** Sample articles with sample scores force saved to DB and fetched from there after. */
/*

const newsItemOne = new news({
    title: "Very positive piece of news!",
    date: new Date("2022-01-28"),
    text: "Super interesting article here.",
    positivityScore: 9
});
newsItemOne.save().then(() => console.log("News Item ONE Has Been Added."));

const newsItemTwo = new news({
    title: "A bit less positive piece of news",
    date: new Date("2021-03-20"),
    text: "Insert content here.",
    positivityScore: 7
});
newsItemTwo.save().then(() => console.log("News Item TWO Has Been Added."));

const newsItemThree = new news({
    title: "Barely positive piece of news...",
    date: new Date("2020-04-20"),
    text: "Sample content.",
    positivityScore: 6
});
newsItemThree.save().then(() => console.log("News Item THREE Has Been Added."));

const newsItemNotToRender = new news({
    title: "Not! positive piece of news",
    date: new Date("2022-01-28"),
    text: "This one shouldn't render at all to DOM! It is for test only.",
    positivityScore: 3
});
newsItemNotToRender.save().then(() => console.log("News Item NOT TO RENDER Has Been Added."));

*/
/*** END OF TEST CASES */
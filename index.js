const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const date = require('date-and-time');
const router = express.Router();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

require('dotenv').config();

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const newSchema = new mongoose.Schema({
    title: String,
    date: Date,
    text: String,
    positivityScore: Number
});

const news = mongoose.model('news', newSchema);

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

app.get("/", (req, res)=>{
    news.find({positivityScore: {$gt: 5}}, (err, newsItem) => {
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
            console.log(newsArticles);
            res.render("index", {
                newsItems: newsArticles
            });
        } else {
        console.log(err);
        res.send("Please investigate the cause behind this error. Check console for error message details.");
        }
    })
});

app.use("/", router);

app.listen(process.env.PORT, () => console.log("Listening to port."));
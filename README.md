# Back-end for Web Scraper

newScrape is the back-end framework for fetching and displaying articles from a database.

## Contents

app.js

/css/style.css

/views/index.pug

#### Please run to install dependencies:

```bash
npm install
```

#### Please inquire further for database username and password (must add to .env file).

## Usage


#### Please run with:
```bash
node index.js
```
#### and check localhost:<port>, 

#### where <port> has been specified in .env as PORT = <port>.


## What has been done so far:

- Articles are fetched from a MongoDB database cluster (Express.js) with the following schema:
```bash
title: String,
date: Date,
text: String,
positivityScore: Number
```
- Articles are filtered, so that those with positivityScore > 5 are displayed to the client.
- Articles are ranked in a descending order based on positivityScore
- Articles are displayed in a flexbox to the client, spaced-around.
- Node.js template engine of choice: Pugjs.

## License
[MIT](https://choosealicense.com/licenses/mit/)
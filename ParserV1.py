from calendar import month
import requests
from bs4 import BeautifulSoup
from datetime import datetime

URL = "https://ir.darlingii.com/news-releases?l=10"
page = requests.get(URL)
soup = BeautifulSoup(page.content, 'html.parser')

results = soup.find_all(class_ = "wd_item")

article = soup.find_all(class_ = "wd_item_wrapper")

for article in article:
    titleContainer = article.find_all(class_ = "wd_title")
    dateContainer = article.find_all(class_ = "wd_date")
    titleAnchorLink = titleContainer[0].contents
    titleList = titleAnchorLink[0].contents
    dateList = dateContainer[0].contents
    title = str(titleList[0])
    date = str(dateList[0])
    print(title)
    print(date)
    newURL = titleAnchorLink[0].get('href')
    newPage = requests.get(newURL)
    newSoup = BeautifulSoup(newPage.content, 'html.parser')
    newsBody = newSoup.find_all(class_ = "wd_news_body")
    articleText = newsBody[0].find_all('p')
    textParsed = "";
    for paragraph in articleText:
        textParsed += paragraph.get_text()
    print(textParsed)














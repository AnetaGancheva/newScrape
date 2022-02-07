import requests
from bs4 import BeautifulSoup

URL = "https://ir.darlingii.com/news-releases?l=10"
page = requests.get(URL)
soup = BeautifulSoup(page.content, 'html.parser')

results = soup.find_all(class_ = "wd_item")

article = soup.find_all(class_ = "wd_item_wrapper")

for article in article:
    title = article.find_all(class_ = "wd_title")
    date = article.find_all(class_ = "wd_date")
    print(article.text)












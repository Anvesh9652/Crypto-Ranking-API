const express = require("express");
const cheeiro = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const app = express();

const port = process.env.PORT || 3000;
const url = "https://www.coingecko.com/";


// Welcome page;

app.get("/", (req, res) => {
  res.send("hello welcome to CRYPTO-CURRENCY API Page");
});


// Currency page
app.get("/currency", (req, res) => {
  const getCurrencyData = async () => {
    const data = [];
    try {
      const response = await axios.get(url);
      const html = await response.data;

      const $ = cheeiro.load(html);

      $("tr").each((i, el) => {
        if (i > 0) {
          const rank = $(el).find(".table-number").text().trim();

          const img = $(el).find(".tw-flex").find("img").attr("src");
          const coin_name = $(el)
            .find(".tw-flex-auto")
            .text()
            .trim()
            .replace(/(\n\n\n)/g, " ");
          const price = $(el).find(".tw-flex-1").find("span").text();
          const _24hVolume = $(el).find(".td-liquidity_score").text().trim();
          const market_cap = $(el).find(".td-market_cap").text().trim();
          const _24hChange = $(el).find(".td-change24h").text().trim();

          data.push({
            "rank": rank,
            "name": coin_name,
            "coinURL": img,
            "price": price,
            "24hChange": _24hChange,
            "24hVolume": _24hVolume,
            "marketCap": market_cap,
          });
        }
      });

      res.json(data);
    } catch (error) {
      console.error(error);
    }
  };
  getCurrencyData();
});

// Exchanges end point

app.get("/exchanges", (req, res) => {
  const getExchangeData = async () => {
    const exchangeData = [];

    try {
      const response = await axios.get(`${url}/en/exchanges`);
      const html = response.data;
      const $ = cheeiro.load(html);
      const keys = [
        "rank",
        "exchanges",
        "iconURL",
        "trustScore",
        "24hVolume",
        "visits",
        "coins",
        "pairs",
      ];

      $("tr").each((i, el) => {
        if (i > 0) {
          const rowObject = {};
          const icon = $(el).find("img").attr("src");
          // rowObject["Icon"] = icon
          $(el)
            .children()
            .each((j, ch) => {
              let tdValue = $(ch).text().trim();
              if (tdValue && j < 7) {
                if (j == 1) {
                  const combined1 = tdValue.split("\n");
                  const combined = combined1.filter((x) => x !== " ");
                  const exchange = combined[0];
                  const exchange_type = combined[1];

                  rowObject["exchange"] = exchange;
                  rowObject["exchangeType"] = exchange_type;
                } else {
                  if (j == 2) tdValue = icon;
                  rowObject[keys[j]] = tdValue;
                }
              }
            });

          exchangeData.push(rowObject);
        }
      });

      res.send(exchangeData);
    } catch (err) {
      console.error(err);
    }
  };

  getExchangeData();
});

// News End point

const newsUrl = "https://www.ndtv.com/business/cryptocurrency/news/page-";

app.get("/news", (req, res) => {
  const getNewsData = async () => {
    try {
      const newsData = [];

      for (i = 1; i <= 4; i++) {
        const response = await axios.get(`${newsUrl}${i}`);

        const html = response.data;
        const $ = cheeiro.load(html);

        const container = $(".news_Itm");

        container.each((i, el) => {
          const pageLink = $(el).find(".news_Itm-img").find("a").attr("href");
          const imgUrl = $(el).find(".news_Itm-img").find("img").attr("src");
          const title = $(el).find(".newsHdng").find("a").text();
          const uploadTime = $(el).find("span").text().trim().substring(11);

          const shortInfo = $(el).find("p").text().trim();

          if (pageLink && imgUrl && title && uploadTime && shortInfo) {
            newsData.push({
              "title": title,
              "uploadDate": uploadTime,
              "imageURL": imgUrl,
              "newsURL": pageLink,
              "shortNews": shortInfo,
            });
          }
        });
      }

      res.send(newsData);
    } catch (err) {
      console.error(err);
    }
  };
  getNewsData();
});

app.listen(port, () => console.log(`server running on ${port}`));

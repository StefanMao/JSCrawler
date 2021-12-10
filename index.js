const locationUrl = location.href;
const searchParam = analyzeUrl(locationUrl);

let maxPage = 0;
let page = 0;

const apiCrawler = async () => {
  let dataArray = [];
  do {
    console.log(`${page}/${maxPage} 正在撈取第${page}頁的數據...`);
    let result = await webCrawler();
    dataArray.push(...result);
    page += 1;
  } while (page <= maxPage);
  return dataArray;
};

console.log("頁面爬抓一筆資料:");
console.log(pageCrawler());
console.log("====================");
console.log("Api 爬抓結果:");
console.log(await apiCrawler());

function pageCrawler() {
  /** Get Frist Data */
  const productElement = document.querySelectorAll('[data-sqe="item"]')[0];
  if (productElement != null) {
    const element = productElement.querySelectorAll('[data-sqe="link"]')[0];

    const link = element.getAttribute("href");
    const imgUrl = element
      .getElementsByClassName("_3-N5L6 _2GchKS")[0]
      .getAttribute("src");

    const title = element.getElementsByClassName("_10Wbs- _5SSWfi UjjMrh")[0]
      .innerText;
    const price = element.getElementsByClassName("_1d9_77")[0].innerText;
    return {
      title: title,
      img: imgUrl,
      link: `https://shopee.tw${link}`,
      price: price,
    };
  } else {
    return `無數據撈取`;
  }
}

function webCrawler() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = transToApiUrl(searchParam, page);
    xhr.open("get", url, true);
    xhr.onload = function () {
      if (this.status == 200) {
        let { total_count, total_ads_count, items } = JSON.parse(
          this.responseText
        );
        let dataTotal = total_count - total_ads_count;
        maxPage = getPageLimit(dataTotal);
        resolve([...formatData(items)]);
      } else {
        reject(`Page${page}發生錯誤`);
      }
    };
    xhr.send(null);
  });
}
function reqError() {
  console.log("error");
}
function formatData(items) {
  const result = items.map((item) => {
    const { name, image, shopid, itemid, price } = item.item_basic;
    return {
      title: name,
      imgUrl: `https://cf.shopee.tw/file/${image}_tn`,
      price: price / 10000,
      link: `https://shopee.tw/${name}-i.${shopid}.${itemid}`,
    };
  });
  return result;
}
function analyzeUrl(url) {
  if (url.indexOf("?") != -1) {
    let str = url.split("?");
    let searchStr = str[1].split("&");
    return searchStr[0];
  }
  return null;
}
function getPageLimit(count) {
  let pageLimit = parseInt(count / 60);
  return count % 60 !== 0 ? pageLimit : pageLimit - 1;
}
function transToApiUrl(searchParam, page) {
  let newest = page * 60;
  return `https://shopee.tw/api/v4/search/search_items?by=relevancy&${searchParam}&limit=60&newest=${newest}&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
}

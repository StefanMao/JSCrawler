
let maxPage = 0;
let page = 0;

const locationUrl = location.href;
const searchParam = analyzeUrl(locationUrl);

const loop = async () => {

  let dataArray = [];
  do {
    let result = await webCrawler();
    dataArray.push(...result)
    page += 1;
    console.log(`${page}/${maxPage} 正在撈取第${page}頁的數據...`)
  } while (page <= maxPage);
  return dataArray;
};

console.log(await loop())

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

function webCrawler() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = transToApiUrl(searchParam, page);
    xhr.open("get", url, true);
    xhr.onload = function () {
      if (this.status == 200) {
        let { adjust, items } = JSON.parse(this.responseText);
        maxPage = getPageLimit(adjust.count);
        // dataArray.push(...formatData(items));
        resolve([...formatData(items)]);
      } else {
        reject(`Page${page}發生錯誤`);
      }
    };
    xhr.send(null);
  });
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

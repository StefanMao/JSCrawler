// const TARGET_URL = "https://shopee.tw/api/v4/search/search_items?by=relevancy&keyword=nintendo%20switch&limit=60&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2"
//https://shopee.tw/api/v4/search/search_items?by=relevancy&keyword=nintendo%20switch&limit=60&newest=60&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2

function reqError() {
  console.log("error");
}

function onReadyStateChange() {
  console.log("stateChange");
  console.log(this.readyState);
  console.log(this.status);

  if (this.readyState === 4 && this.status == 200) {
    let { adjust, items } = JSON.parse(this.responseText);
    maxPage = getPageLimit(adjust.count);
    dataArray.push(...formatData(items));
    page = page + 1;
    console.log('page stateChange')
    console.log(page);
  }
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

function webCrawler(searchParam) {
  let xhr = new XMLHttpRequest();
  xhr.onerror = reqError;
  xhr.onreadystatechange = onReadyStateChange;

  do {
    console.log(page);
    console.log(maxPage);
    const url = transToApiUrl(searchParam, page);
    xhr.open("get", url, true);
    xhr.send(null);
    console.log(page);
  } while (page <= 5);
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

/** 目標網址 */
// const TARGET_URL = "https://shopee.tw/search?keyword=nintendo%20switch";
// const TARGET_URL =
// "https://shopee.tw/api/v4/search/search_items?by=relevancy&keyword=nintendo%20switch&limit=60&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2";

let dataArray = [];
let page = 0;
let maxPage = 0;

(function () {
  const locationUrl = location.href;
  const searchParam = analyzeUrl(locationUrl);

  if (searchParam) {
    webCrawler(searchParam);
  }
})();

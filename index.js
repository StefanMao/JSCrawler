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
    let { items } = JSON.parse(this.responseText);
    dataArray.push(...formatData(items))
    console.log(dataArray)
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

function webCrawler(url) {
  let xhr = new XMLHttpRequest();
  xhr.onerror = reqError;
  xhr.onreadystatechange = onReadyStateChange;


  xhr.open("get", url, true);
  xhr.send(null);

}

function getLocationUrl(){
 return location.href;
}

/** 目標網址 */
// const TARGET_URL = "https://shopee.tw/search?keyword=nintendo%20switch";


const TARGET_URL =
  "https://shopee.tw/api/v4/search/search_items?by=relevancy&keyword=nintendo%20switch&limit=60&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2";

  let dataArray = []
  let page = 0
  
  console.log(getLocationUrl())
  webCrawler(TARGET_URL);


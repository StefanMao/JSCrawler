class WebCrawler extends XMLHttpRequest {
  #targetUrl;
  #searchParam;

  constructor({ url, pageStart = 0, pageLimit = 0 } = {}) {
    super();
    this.#targetUrl = url;
    this.#searchParam = this.getSearchParam();

    this.page = pageStart;
    this.pageLimit = pageLimit;
    this.dataArray = [];
  }

  async doCrawler() {
    do {
      let result = await this.webCrawler();
      this.showCrawlingMsg();
      this.dataArray.push(...result);
      this.page += 1;
    } while (this.page <= this.pageLimit);
    return this.dataArray;
  }

  webCrawler() {
    return new Promise((resolve, reject) => {
      const url = this.transToApiUrl();
      this.open("get", url, true);
      this.onload = function () {
        if (this.status == 200) {
          let { total_count, items } = JSON.parse(this.responseText);
          this.pageLimit = this.getPageLimit(total_count);
          resolve([...this.formatData(items)]);
        } else {
          reject(`Page${this.page}發生錯誤`);
        }
      };
      this.send(null);
    });
  }

  formatData(items) {
    const result = items.map((item) => {
      const { name, image, shopid, itemid, price } = item.item_basic;
      return {
        title: name,
        imgUrl: `https://cf.shopee.tw/file/${image}_tn`,
        price: `$${price / 100000}`,
        link: `https://shopee.tw/${name}-i.${shopid}.${itemid}`,
      };
    });
    return result;
  }

  transToApiUrl() {
    let newest = this.page * 60;
    return `https://shopee.tw/api/v4/search/search_items?by=relevancy&${
      this.#searchParam
    }&limit=60&newest=${newest}&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
  }

  getPageLimit(count) {
    let pageLimit = parseInt(count / 60);
    return count % 60 !== 0 ? pageLimit : pageLimit - 1;
  }

  getSearchParam() {
    if (this.#targetUrl.indexOf("?") != -1) {
      let str = this.#targetUrl.split("?");
      let searchStr = str[1].split("&");
      return searchStr[0];
    }
    return null;
  }

  showCrawlingMsg() {
    console.log(
      `目前進度:${this.page}/${this.pageLimit}，正在撈取第${this.page}頁的數據...`
    );
  }

  doPageCrawler() {
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
        price: `$${price}`,
      };
    } else {
      return `無數據撈取`;
    }
  }
}

let nintendoSwitch = new WebCrawler({ url: location.href });

console.log("頁面爬抓一筆資料結果:");
console.log(nintendoSwitch.doPageCrawler());

console.log("Api爬抓結果:");
console.log(await nintendoSwitch.doCrawler());

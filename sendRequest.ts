import axios from 'axios';
import { sendTelegramMessage } from './telegram';

const url = 'https://shop.amul.com/api/1/entity/ms.products?fields[name]=1&fields[brand]=1&fields[categories]=1&fields[collections]=1&fields[alias]=1&fields[sku]=1&fields[price]=1&fields[compare_price]=1&fields[original_price]=1&fields[images]=1&fields[metafields]=1&fields[discounts]=1&fields[catalog_only]=1&fields[is_catalog]=1&fields[seller]=1&fields[available]=1&fields[inventory_quantity]=1&fields[net_quantity]=1&fields[num_reviews]=1&fields[avg_rating]=1&fields[inventory_low_stock_quantity]=1&fields[inventory_allow_out_of_stock]=1&fields[default_variant]=1&fields[variants]=1&fields[lp_seller_ids]=1&filters[0][field]=categories&filters[0][value][0]=protein&filters[0][operator]=in&filters[0][original]=1&facets=true&facetgroup=default_category_facet&limit=24&total=1&start=0&cdc=1m&substore=66505ff5af6a3c7411d2f4b2';

const headers = {
  'authority': 'shop.amul.com',
  'method': 'GET',
  'path': '/api/1/entity/ms.products?fields[name]=1&fields[brand]=1&fields[categories]=1&fields[collections]=1&fields[alias]=1&fields[sku]=1&fields[price]=1&fields[compare_price]=1&fields[original_price]=1&fields[images]=1&fields[metafields]=1&fields[discounts]=1&fields[catalog_only]=1&fields[is_catalog]=1&fields[seller]=1&fields[available]=1&fields[inventory_quantity]=1&fields[net_quantity]=1&fields[num_reviews]=1&fields[avg_rating]=1&fields[inventory_low_stock_quantity]=1&fields[inventory_allow_out_of_stock]=1&fields[default_variant]=1&fields[variants]=1&fields[lp_seller_ids]=1&filters[0][field]=categories&filters[0][value][0]=protein&filters[0][operator]=in&filters[0][original]=1&facets=true&facetgroup=default_category_facet&limit=24&total=1&start=0&cdc=1m&substore=66505ff5af6a3c7411d2f4b2',
  'scheme': 'https',
  'accept': 'application/json, text/plain, */*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-US,en;q=0.9',
  'base_url': 'https://shop.amul.com/en/browse/protein',
  'cookie': 'jsessionid=s%3AyaNMV%2FNC3JhQ0i2ynd55Xq3Y.8qbBGZz%2F1LPN6W8QHLwFd1d4ijiry4H9o5d5Tj5xtPk; __cf_bm=0cvUdTiRE8UO4Tn1TxcU2gtKgYfELrWedJmxtBC3vfY-1753528969-1.0.1.1-VFnDgxCX04mAE2BWm330n0ot9kl5kSTmG5vhz7QFxvS6FmcK5c1XhNj231QCqgESaBviflM_7j9pakTq8E_GDE7B67vZZfI7mnx4trKbpDI; _fbp=fb.1.1753528970637.692463298565284189; _ga=GA1.1.2086923817.1753528971; _ga_E69VZ8HPCN=GS2.1.s1753528970$o1$g0$t1753528979$j51$l0$h675972718',
  'frontend': '1',
  'if-none-match': 'W/"20290189"',
  'priority': 'u=1, i',
  'referer': 'https://shop.amul.com/',
  'sec-ch-ua': '"Google Chrome";v="129", "Not-A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Linux"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'tid': '1753528980455:571:d1f5288fc45745c9ad23cf19b7dad57e215f0895af2b01ca4c4f60ceeac1d7c9',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};

export async function makeRequestWithRetries() {

  const startTime = Date.now();
  let lastTelegramErrReportTimestamp: number = -1;

  while(true) {
    try {
      return await axios.get(url, { headers, timeout: 10 * 1000 });
    } catch (err) {
      console.log('Error caught in catch block: ', err);
      if (err.message.includes('timeout') && err.message.includes('exceeded')) {
        console.error('Error: axios request timeout exceeded!');
        console.error('Retrying...')
        if (Date.now() - startTime <= 2* 60 * 1000) {
          continue;
        }

        if (lastTelegramErrReportTimestamp === -1 || (Date.now() - lastTelegramErrReportTimestamp > 1 * 60 * 1000)) {
          lastTelegramErrReportTimestamp = Date.now();
          sendTelegramMessage('Failing to get response from amul API for the last 2 minutes!')
        }

        continue;
      }

      throw err;
    }
  }
}
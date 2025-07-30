import axios from 'axios';
import { sendTelegramMessage } from './telegram';

const url = 'https://shop.amul.com/api/1/entity/ms.products?fields[name]=1&fields[brand]=1&fields[categories]=1&fields[collections]=1&fields[alias]=1&fields[sku]=1&fields[price]=1&fields[compare_price]=1&fields[original_price]=1&fields[images]=1&fields[metafields]=1&fields[discounts]=1&fields[catalog_only]=1&fields[is_catalog]=1&fields[seller]=1&fields[available]=1&fields[inventory_quantity]=1&fields[net_quantity]=1&fields[num_reviews]=1&fields[avg_rating]=1&fields[inventory_low_stock_quantity]=1&fields[inventory_allow_out_of_stock]=1&fields[default_variant]=1&fields[variants]=1&fields[lp_seller_ids]=1&filters[0][field]=categories&filters[0][value][0]=protein&filters[0][operator]=in&filters[0][original]=1&facets=true&facetgroup=default_category_facet&limit=24&total=1&start=0&cdc=1m&substore=66505ff5af6a3c7411d2f4b2';

const AMUL_API_COOKIE = process.env.AMUL_API_COOKIE;

if (!AMUL_API_COOKIE) {
    console.error('Invalid env configuration! AMUL_API_COOKIE not found');
    process.exit(1);
}

const headers = {
  'authority': 'shop.amul.com',
  'method': 'GET',
  'path': '/api/1/entity/ms.products?fields[name]=1&fields[brand]=1&fields[categories]=1&fields[collections]=1&fields[alias]=1&fields[sku]=1&fields[price]=1&fields[compare_price]=1&fields[original_price]=1&fields[images]=1&fields[metafields]=1&fields[discounts]=1&fields[catalog_only]=1&fields[is_catalog]=1&fields[seller]=1&fields[available]=1&fields[inventory_quantity]=1&fields[net_quantity]=1&fields[num_reviews]=1&fields[avg_rating]=1&fields[inventory_low_stock_quantity]=1&fields[inventory_allow_out_of_stock]=1&fields[default_variant]=1&fields[variants]=1&fields[lp_seller_ids]=1&filters[0][field]=categories&filters[0][value][0]=protein&filters[0][operator]=in&filters[0][original]=1&facets=true&facetgroup=default_category_facet&limit=24&total=1&start=0&cdc=1m&substore=66505ff5af6a3c7411d2f4b2',
  'scheme': 'https',
  'accept': 'application/json, text/plain, */*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-US,en;q=0.9',
  'base_url': 'https://shop.amul.com/en/browse/protein',
  'cookie': AMUL_API_COOKIE,
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
      console.log('Error caught in catch block: ', err.message);
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
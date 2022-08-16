# MOSAIC_BE

Nodejs backend functions linked to mysql db.

retrieves and sends data for categories and snp&cmc graph


## Coin Categories


### Initialization
1. Go to "coin_categories/init"

1. Run createAndInsertCoinDeskCoinsList() in "coin_categories/init/coindesk_coins_list.js"

2. Run initializeCategoryDb() in "coin_categories/init/categories_coins_list.js"

3. Run allCategoryCoinsPricesDaily() and allCategoryCoinsPricesHourly() in "all_category_prices.js"
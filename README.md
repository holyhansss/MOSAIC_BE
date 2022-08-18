# MOSAIC_BE

Nodejs backend functions linked to mysql db.

retrieves and sends data for categories and snp&cmc graph


### Initialization

## Coin Categories

1. Go to "coin_categories/init"
2. Run node init.js


##  SNP CMC data

* 파일 정리

1. snp_cmc/api.js : API를 호출하여 데이터를 받아오는 함수 (1개월, 1년 단위) 
- day는 업데이트를 1분 마다 하기에 mysql에 저장 안 하기로 했음
2. snp_cmc/queries.js: 테이블 생성/ 업데이트/ 데이터 삽입을 하는 함수의 집합소
3. snp_cmc/control.js: 쿼리를 실제 실행하는 곳 

* 테이블 생성및 관리 
0. 데이터 베이스 생성 후 계정 정보를 config 파일 안에 database2.js 파일을 만들어 저장 -> 생성한 데이터 베이스 use 명령어 실행 (musql)
1. Go to "snp_cmc"
2. await create_SNPCMC_1mo(); or await create_SNPCMC_1year();  주석 풀고 해당 함수 호출
3. Run node control.js
4. 실행 후 주석처리 (밑에 실행함수도 주석처리)
5. Run node init.js 하고 그래프뜨는 지 보기 

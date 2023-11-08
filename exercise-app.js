'use strict';
const fs = require('node:fs');
const readline = require('node:readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs });
const prefectureDataMap = new Map();                // key: 都道府県 value: 集計データのオブジェクト

rl.on('line', lineString => {                       // 1行ごとに読み込み [集計年,都道府県名,10〜14歳の人口,15〜19歳の人口
    const columns = lineString.split(',');          // 配列に分割
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2016 || year === 2021) {
        let value = null;
        if (prefectureDataMap.has(prefecture)) {        // 2016年データと2021年データがあり、都道府県の重複を防ぐ
            value = prefectureDataMap.get(prefecture);
        } else {
            value = {
                before: 0,      // 2016年の人口
                after: 0,       // 2021年の人口
                change: null    // 変化率
            };
        }

        if (year === 2016) {
            value.before = popu;
        }
        if (year === 2021) {
            value.after = popu;
        }

        prefectureDataMap.set(prefecture, value);
    }
});

rl.on('close', () => {
    for (const [key, value] of prefectureDataMap) {
        value.change = value.after / value.before;
    }

    const rankingArray = Array.from(prefectureDataMap).sort((first, second) => {    // firstとsecondは[prefecture, value{before, after, change}]
        return first[1].change - second[1].change;                                  // second - first > 0 のとき入れ替え
    });

    const rankingStrings = rankingArray.map(([key, value], rankNum) => {
        return `${rankNum + 1}位  ${key}: ${value.before} => ${value.after}  変化率: ${value.change}`;
    });

    console.log(rankingStrings);
})

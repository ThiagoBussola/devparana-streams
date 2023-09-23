// transform - SQL data (sqlite) to noSQL (json data)
import sqlite3 from "sqlite3";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { createWriteStream } from "node:fs";

const connection = sqlite3.verbose();
const db = new connection.Database("./data/db");
const serializeAsync = promisify(db.serialize.bind(db));
const findAllAsync = promisify(db.all.bind(db));

console.time("sql-to-ndjson");

await serializeAsync();

async function* selectAsStream() {
  const defaultLimit = 100;
  let skip = 0;

  while (true) {
    const data = await findAllAsync(
      `SELECT * FROM users LIMIT ${defaultLimit} OFFSET ${skip}`
    );

    skip += defaultLimit;
    // if we've consumed all data it's gonna stop!
    if (!data.length) break;
    for (const item of data) yield item;
  }
}

// Quando usamos o Array.map, ou filter... o problema de fazer isso é que nós colocamos todos os dados na memória, e isso pode ser um problema,
// pois se tivermos muitos dados, podemos ter problemas de performance, e até mesmo travar o nosso sistema.
// Por isso, é melhor usar o stream, pois ele vai consumir os dados aos poucos, e não vai colocar tudo na memória.
// Ele vai processar os dados sob demanda a cada passo e só depois vai para o próximo passo.
// Nesse caso utilizamos os mesmos métodos mas da nova API de streams

let processed = 0;
const stream = Readable.from(selectAsStream())
  .filter(({ age }) => age > 25 && age < 50)
  .map(async (item) => {
    const name = await Promise.resolve(item.name.toUpperCase());
    return { ...item, name, at: new Date().toISOString() };
  })
  .map((item) => {
    processed++;
    return JSON.stringify(item).concat("\n");
  });
//.forEach((item) => console.log(item));

await pipeline(stream, createWriteStream("./data/users.ndjson"));

console.log(`\nprocess has finished with ${processed} items...\n`);
console.timeEnd("sql-to-ndjson");

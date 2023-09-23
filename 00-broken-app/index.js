// for i in `seq 1 20`; do node -e "process.stdout.write('hello world'.repeat(1e7))" >> big-file.txt; done
import { promises, createReadStream, statSync } from "node:fs";

// statSync brings the file size in bytes and other info

const filename = "big-file.txt";

await promises.readFile(filename);

// try {
//   const file = await promises.readFile(filename);
//   console.log("file size", file.byteLength / 1e9, "GB", "\n");
//   console.log("fileBuffer", file);
// } catch (error) {
//   console.log("error: max 2GB reached..", error.message);
// }

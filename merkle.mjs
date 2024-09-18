import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import csv from "csv-parser";

const csvFilePath = "./BoredApeYachtClub.csv"; // Path to your CSV file
const searchAddress = "0x27677a95F17dE170FD4cbac47712784Fa3Be4D02"; // Address to search

// Function to read the CSV file
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const values = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        values.push([row.address, row.amount]);
      })
      .on("end", () => {
        resolve(values);
      })
      .on("error", reject);
  });
}

// Function to generate the Merkle Tree
async function generateMerkleTree() {
  try {
    const values = await readCSV(csvFilePath);
    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
    console.log("Merkle Root:", tree.root);
    fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
  } catch (error) {
    console.error("Error generating Merkle tree:", error);
  }
}

// Function to generate proof for a given address
async function generateProof() {
  try {
    const tree = StandardMerkleTree.load(
      JSON.parse(fs.readFileSync("tree.json", "utf8"))
    );
    for (const [i, v] of tree.entries()) {
      if (v[0] === searchAddress) {
        const proof = tree.getProof(i);
        console.log("Value:", v);
        console.log("Proof:", proof);
      }
    }
  } catch (error) {
    console.error("Error generating proof:", error);
  }
}

// Execute the functions
await generateMerkleTree();
await generateProof();

const crypto = require("crypto");

function generateKeyWithHash(hashAlgorithm, bits) {
  const bytes = bits / 8;
  const randomBytes = crypto.randomBytes(bytes);

  // Cria o hash baseado no algoritmo especificado
  const hash = crypto
    .createHash(hashAlgorithm)
    .update(randomBytes)
    .digest("hex");

  return hash;
}

// Usando diferentes algoritmos SHA
const sha1Key = generateKeyWithHash("sha1", 160); // Gera uma chave SHA-1 (160 bits)
const sha224Key = generateKeyWithHash("sha224", 224); // Gera uma chave SHA-224 (224 bits)
const sha256Key = generateKeyWithHash("sha256", 256); // Gera uma chave SHA-256 (256 bits)
const sha384Key = generateKeyWithHash("sha384", 384); // Gera uma chave SHA-384 (384 bits)
const sha512Key = generateKeyWithHash("sha512", 512); // Gera uma chave SHA-512 (512 bits)

console.log("Chave SHA-1:", sha1Key);
console.log("Chave SHA-224:", sha224Key);
console.log("Chave SHA-256:", sha256Key);
console.log("Chave SHA-384:", sha384Key);
console.log("Chave SHA-512:", sha512Key);

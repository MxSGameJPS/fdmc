const sharp = require("sharp");
const path = require("path");
const { fileURLToPath } = require("url");
const fs = require("fs");

// Obter diretório atual
const currentDir = process.cwd();

// Caminho para o ícone original
const inputPath = path.join(currentDir, "assets", "images", "icon.png");
// Caminho para o novo ícone quadrado
const outputPath = path.join(currentDir, "assets", "images", "icon-square.png");

// Redimensionar para 1024x1024 (tamanho recomendado para ícones de app)
sharp(inputPath)
  .resize(1024, 1024, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 }, // Fundo branco
  })
  .toFile(outputPath)
  .then(() => {
    console.log("Ícone quadrado criado com sucesso em:", outputPath);
  })
  .catch((err) => {
    console.error("Erro ao criar o ícone quadrado:", err);
  });

require('dotenv').config();

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Remplace par tes propres identifiants API
const pinata_api_key = process.env.PINATA_API_KEY;
const pinata_api_secret = process.env.PINATA_API_SECRET_KEY;

async function uploadToPinata() {
  try {
    // Chemin vers ton image (assure-toi que le fichier existe dans le même dossier)
    const imagePath = path.join(__dirname, 'Exemple.jpg');
    const fileStream = fs.createReadStream(imagePath);

    // Préparer le formulaire
    const formData = new FormData();
    formData.append('file', fileStream);

    // URL de l'API Pinata pour uploader un fichier
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    // Effectuer la requête POST
    const response = await axios.post(url, formData, {
      maxContentLength: Infinity,
      headers: {
        // Les headers pour gérer le multipart/form-data
        ...formData.getHeaders(),
        // Tes identifiants Pinata
        pinata_api_key: pinata_api_key,
        pinata_secret_api_key: pinata_api_secret,
      },
    });

    console.log('Image uploadée avec succès sur Pinata !');
    console.log('Réponse de Pinata :', response.data);
    // La réponse contiendra le hash (CID) de ton fichier, par exemple :
    // { IpfsHash: "Qm...", PinSize: 12345, Timestamp: "2025-02-08T00:00:00Z" }
    console.log(`URL IPFS : ipfs://${response.data.IpfsHash}`);
  } catch (error) {
    console.error("Erreur lors de l'upload sur Pinata :", error.response ? error.response.data : error.message);
  }
}

uploadToPinata();

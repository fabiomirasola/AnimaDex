const { NFTStorage, File } = require('nft.storage')
const fs = require('fs')

// Remplacez par votre clé API NFT.storage
const API_KEY = 'VOTRE_CLE_API_ICI'
const client = new NFTStorage({ token: API_KEY })

async function uploadMetadata() {
  // Lisez votre fichier JSON de métadonnées (assurez-vous qu'il soit dans le même dossier)
  const metadataContent = fs.readFileSync('metadata.json')
  
  const metadataFile = new File([metadataContent], 'metadata.json', { type: 'application/json' })
  
  const cid = await client.storeBlob(metadataFile)
  console.log('Les métadonnées sont accessibles via IPFS à l’URL :', `ipfs://${cid}`)
}

uploadMetadata()

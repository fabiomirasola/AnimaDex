import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
    Animated,
    Alert,
    SafeAreaView,
    Vibration,
} from "react-native";
import axios from "axios";
import {ConnectWalletButton} from "@/components/ConnectWalletButton";
const PINATA_API_KEY = import.meta.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.PINATA_SECRET_API_KEY;
// Pour l'exemple de minting, vous pouvez utiliser ethers.js
// import { ethers } from "ethers";

export default function App() {
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [imageUri, setImageUri] = useState(null);
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detectedAnimal, setDetectedAnimal] = useState(null);
    const [animationOpacity] = useState(new Animated.Value(0));
    const [resultVisible] = useState(new Animated.Value(0));
    const cameraRef = useRef(null);
    const [nftProcessing, setNftProcessing] = useState(false);

    // --- Fonction d'upload pour la détection (déjà existante)
    const uploadImage = useCallback(async (uri) => {
        setLoading(true);
        setDetections([]);
        setDetectedAnimal(null);
        Animated.timing(resultVisible, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        const formData = new FormData();
        formData.append("file", {
            uri: uri,
            name: "image.jpg",
            type: "image/jpeg",
        });

        try {
            const serverIP = "http://10.21.245.80:8000/detect";
            const response = await axios.post(serverIP, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 20000,
            });

            const detectionsData = response.data.detections;
            if (!detectionsData || detectionsData.length === 0) {
                setDetections([{ label: "Aucun animal détecté", confidence: 1 }]);
            } else {
                setDetections(detectionsData);
                const firstDetection = detectionsData[0];
                const animalIcons = {
                    chien: require("../../assets/dog.png"),
                    chat: require("../../assets/cat.png"),
                    oiseau: require("../../assets/bird.png"),
                };
                if (animalIcons[firstDetection.label.toLowerCase()]) {
                    setDetectedAnimal(animalIcons[firstDetection.label.toLowerCase()]);
                    Vibration.vibrate(200);
                    Animated.sequence([
                        Animated.timing(animationOpacity, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.delay(2000),
                        Animated.timing(animationOpacity, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            }
            Animated.timing(resultVisible, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            return detectionsData;
        } catch (error) {
            console.error("Erreur en envoyant l'image :", error);
            Alert.alert("Erreur", "Une erreur est survenue lors de la détection.");
            setDetections([{ label: "Erreur lors de la détection", confidence: 1 }]);
            return null;
        } finally {
            setLoading(false);
        }
    }, [resultVisible, animationOpacity]);

    // --- Prendre une photo
    const takePicture = useCallback(async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setImageUri(photo.uri);
                await uploadImage(photo.uri);
            } catch (error) {
                console.error("Erreur de capture :", error);
            }
        } else {
            console.error("Erreur : cameraRef est null !");
        }
    }, [uploadImage]);

    // --- Basculer la caméra
    const toggleCameraFacing = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    // --- Upload de l'image sur IPFS via Pinata
    async function uploadImageToIPFS(imageUri) {
        const formData = new FormData();
        formData.append("file", {
            uri: imageUri,
            name: "image.jpg",
            type: "image/jpeg",
        });

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: "VOTRE_PINATA_API_KEY",
                    pinata_secret_api_key: "VOTRE_PINATA_SECRET_API_KEY",
                },
            }
        );
        const ipfsHash = response.data.IpfsHash;
        return `https://ipfs.io/ipfs/${ipfsHash}`;
    }

    // --- Upload du JSON (métadonnées) sur IPFS via Pinata
    async function uploadJSONToIPFS(metadata) {
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
            }
        );
        const ipfsHash = response.data.IpfsHash;
        return `https://ipfs.io/ipfs/${ipfsHash}`;
    }

    // --- Fonction de mint (exemple simplifié)
    async function mintNFT(metadataURI, userWalletAddress) {
        // Exemple avec ethers.js
        // Vous devez configurer votre provider, signer la transaction via WalletConnect, etc.
        // Voici un pseudo-code :
        /*
        const provider = new ethers.providers.InfuraProvider("rinkeby", "VOTRE_INFURA_PROJECT_ID");
        const signer = provider.getSigner();
        const contractAddress = "ADRESSE_DE_VOTRE_CONTRAT";
        const contractABI = [ ... ]; // ABI de votre contrat ERC-721
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.mintNFT(userWalletAddress, metadataURI);
        await tx.wait();
        return tx;
        */
        Alert.alert("Mint NFT", "Mint du NFT (fonction à implémenter) !");
    }

    // --- Handler pour convertir l'image en NFT
    const handleConvertToNFT = async () => {
        try {
            setNftProcessing(true);
            // 1. Upload de l'image sur IPFS
            const imageIPFSUrl = await uploadImageToIPFS(imageUri);
            // 2. Création des métadonnées
            const metadata = {
                name: "Mon NFT Photo",
                description: "Photo prise avec l'application",
                image: imageIPFSUrl,
            };
            // 3. Upload des métadonnées sur IPFS
            const metadataIPFSUrl = await uploadJSONToIPFS(metadata);
            // 4. Mint du NFT
            // Vous devrez récupérer l'adresse du wallet de l'utilisateur via WalletConnect ou une autre solution.
            const userWalletAddress = "ADRESSE_DU_WALLET_DE_L_UTILISATEUR"; // À remplacer
            await mintNFT(metadataIPFSUrl, userWalletAddress);
            Alert.alert("Succès", "Votre photo a été mintée en NFT et est disponible dans votre wallet !");
        } catch (error) {
            console.error("Erreur lors de la conversion en NFT", error);
            Alert.alert("Erreur", "La conversion en NFT a échoué.");
        } finally {
            setNftProcessing(false);
        }
    };

    if (!permission)
        return <View style={{ flex: 1, backgroundColor: "#121212" }} />;

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    📸 Nous avons besoin de votre permission pour utiliser la caméra.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Autoriser</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                        <Text style={styles.flipText}>🔄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takePicture}
                        accessibilityLabel="Prendre une photo"
                    />
                </CameraView>

                <ConnectWalletButton />

                {imageUri && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    </View>
                )}

                {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

                {detections.length > 0 && (
                    <Animated.View style={[styles.resultContainer, { opacity: resultVisible }]}>
                        <Text style={styles.resultTitle}>📌 Résultats :</Text>
                        {detections.map((det, index) => (
                            <Text
                                key={index}
                                style={[
                                    styles.resultText,
                                    { color: det.label === "Aucun animal détecté" ? "#FF6B6B" : "#AAA" },
                                ]}
                            >
                                {det.label} {det.label !== "Aucun animal détecté" ? `- ${Math.round(det.confidence * 100)}%` : ""}
                            </Text>
                        ))}
                    </Animated.View>
                )}

                {detectedAnimal && (
                    <Animated.View style={[styles.animalPopup, { opacity: animationOpacity }]}>
                        <Image source={detectedAnimal} style={styles.animalIcon} />
                    </Animated.View>
                )}

                {/* Bouton pour convertir la photo en NFT */}
                {imageUri && !nftProcessing && (
                    <TouchableOpacity style={styles.nftButton} onPress={handleConvertToNFT}>
                        <Text style={styles.nftButtonText}>Convertir en NFT</Text>
                    </TouchableOpacity>
                )}

                {nftProcessing && (
                    <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#121212",
    },
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        paddingBottom: 60,
    },
    camera: {
        width: "100%",
        height: "65%",
        justifyContent: "flex-end",
        alignItems: "center",
        borderRadius: 20,
        overflow: "hidden",
    },
    flipButton: {
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 50,
        padding: 10,
    },
    flipText: {
        fontSize: 20,
        color: "#FFF",
    },
    captureButton: {
        width: 70,
        height: 70,
        backgroundColor: "#FFF",
        borderRadius: 50,
        borderWidth: 5,
        borderColor: "#007AFF",
        marginBottom: 20,
    },
    imageContainer: {
        marginTop: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    loader: {
        marginTop: 20,
    },
    resultContainer: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderRadius: 10,
        marginTop: 10,
        width: "90%",
        alignItems: "center",
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 10,
    },
    resultText: {
        fontSize: 16,
        color: "#AAA",
    },
    animalPopup: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        // Optionnel: backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    animalIcon: {
        width: 100,
        height: 100,
        resizeMode: "contain",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
    permissionText: {
        color: "#FFF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    permissionButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    nftButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#FF6B6B",
        borderRadius: 5,
    },
    nftButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
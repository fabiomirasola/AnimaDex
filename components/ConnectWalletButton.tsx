import { StyleSheet, Text, View, Pressable } from 'react-native';

import {
    WalletConnectModal,
    useWalletConnectModal,
} from '@walletconnect/modal-react-native';
// Add in the useWalletConnectModal hook

const projectId = '8c5056218e53d1ca1795be37b6da924d';

const providerMetadata = {
    name: 'GenZoo',
    description: 'YOUR_PROJECT_DESCRIPTION',
    url: 'https://your-project-website.com/',
    icons: ['https://your-project-logo.com/'],
    redirect: {
        native: 'YOUR_APP_SCHEME://',
        universal: 'YOUR_APP_UNIVERSAL_LINK.com',
    },
};

export default function App() {
    // Add in the useWalletConnectModal hook + props
    const { open, isConnected, address, provider } = useWalletConnectModal();

    // Function to handle the
    const handleButtonPress = async () => {
        if (isConnected) {
            return provider?.disconnect();
        }
        return open();
    };

    // Main UI Render
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>WalletConnect Modal RN Tutorial</Text>
            <Text>{isConnected ? address : 'No Connected'}</Text>
            <Pressable
                onPress={handleButtonPress}
                style={styles.pressableMargin}
            >
                <Text>{isConnected ? 'Disconnect' : 'Connect'}</Text>
            </Pressable>

            <WalletConnectModal
                explorerRecommendedWalletIds={[
                    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
                ]}
                explorerExcludedWalletIds={'ALL'}
                projectId={projectId}
                providerMetadata={providerMetadata}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    pressableMargin: {
        marginTop: 16,
    },
});

/*import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAccount, useDisconnect } from 'wagmi';
import {WalletConnectModal, useWalletConnectModal} from '@walletconnect/modal-react-native';

export function ConnectWalletButton() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const connector = useWalletConnectModal(); // WalletConnect handler

    const [connecting, setConnecting] = useState(false);

    const connectWallet = async () => {
        try {
            setConnecting(true);
            await connector.connect();
        } catch (error) {
            console.error('Erreur de connexion au wallet:', error);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <View style={styles.container}>
            {isConnected ? (
                <>
                    <Text style={styles.connectedText}>✅ Connecté : {address.slice(0, 6)}...{address.slice(-4)}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => disconnect()}>
                        <Text style={styles.buttonText}>Déconnecter</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <TouchableOpacity style={styles.button} onPress={connectWallet} disabled={connecting}>
                    <Text style={styles.buttonText}>
                        {connecting ? 'Connexion...' : '🔌 Connecter Wallet'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    connectedText: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginVertical: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
    },
});*/
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, RefreshControl, Alert } from 'react-native';
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../services/firebase.config';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Animatable from 'react-native-animatable';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true); // Controle da animação de carregamento
    const [selectedImage, setSelectedImage] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchImages();  // Ao carregar a tela, busca as imagens do Firebase Storage
    }, []);

    const fetchImages = async () => {
        setLoading(true); // 
        try {
            const listRef = ref(storage, 'images/');  // Referência para o diretório de imagens no Firebase Storage
            const res = await listAll(listRef);   // Lista todas as imagens no diretório
            const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));  // Obtém as URLs das imagens
            setImages(urls);  // Atualiza o estado das imagens com as URLs
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl); // Define a imagem selecionada para visualização
    };

    const closeModal = () => {
        setSelectedImage(null); // Fecha a visualização da imagem
    };

    const downloadImage = async (url) => {  // Função para download da imagem
        try {
            // Pedir permissão para acessar a biblioteca de mídia
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permissão para acessar a galeria foi negada.');
                Alert.alert('Permissão negada', 'Permissão para acessar a biblioteca de mídia foi negada.', [{ text: 'OK' }]);
                return;
            }

            // Baixar a imagem
            const fileUri = FileSystem.documentDirectory + url.substring(url.lastIndexOf('/') + 1);
            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            // Salvar a imagem na galeria
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            console.log('Imagem baixada com sucesso!');
            Alert.alert('Imagem Baixada', 'A imagem foi baixada com sucesso!', [{ text: 'OK' }]);
        } catch (error) {
            console.log(error);
            Alert.alert('Erro!', 'Falha ao baixar a imagem.', [{ text: 'OK' }]);
        }
    };

    const deleteImage = async (url) => {    // Função para deletar a imagem
        try {
            const fileName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1).split('?')[0]);  // Extrair e decodificar o nome do arquivo da URL
            const imageRef = ref(storage, `/${fileName}`);
            await deleteObject(imageRef);
            console.log("Uma imagem foi deletada!");
            Alert.alert('Imagem Excluída', 'A imagem foi excluída com sucesso!', [{ text: 'OK' }]);
            fetchImages();  // Atualiza a lista de imagens após exclusão
            closeModal();  // Fecha a visualização da imagem
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha ao excluir a imagem.', [{ text: 'OK' }]);
        }
    };

    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        if (contentOffset.y <= -50) { // Define o limite para o scroll para cima
            setRefreshing(true);
            fetchImages(); // Atualiza as imagens
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchImages(); // Atualiza as imagens
        setRefreshing(false);
    };

    return (
        <Animatable.View animation='fadeInUp' style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContainer}
                onScroll={handleScroll}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {images.map((imageUrl, index) => (
                    <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.loadingText} />
            <Modal visible={!!selectedImage} transparent={true} onRequestClose={closeModal}>
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                            <View style={styles.containerButtons}>
                                <TouchableOpacity style={styles.downloadButton} onPress={() => downloadImage(selectedImage)}>
                                    <Text style={styles.downloadTextButton}>Baixar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(selectedImage)}>
                                    <Text style={styles.deleteTextButton}>Deletar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5EAF0',
        padding: 0,
    },
    scrollViewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
        marginHorizontal: 5,
        borderRadius: 5,
    },
    loadingText: {
        color: '#fff',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '90%',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    downloadButton: {
        backgroundColor: '#1A73E8',
        width: '30%',
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'center'
    },
    downloadTextButton: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold'
    },
    deleteButton: {
        backgroundColor: '#DC143C',
        width: '30%',
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'center'
    },
    deleteTextButton: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold'
    }
});
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react'
import * as Animatable from 'react-native-animatable'
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../../services/firebase.config";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';


export default function Upload() {

    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState(null); // Para pré-visualizar a imagem
    const clearInputs = () => { // Para limpar imagem selecionada
        setImage(null);
        setImagePreview(null);
        console.log("Pré-visualização limpada");
    };
    const [loading, setLoading] = useState(false);  // Controle da animação de carregamento

    const submitData = async () => {
        if (!image) {
            console.log('Nenhuma imagem selecionada');
            alert("Selecione uma imagem!");
            return;
        }

        setLoading(true);

        const response = await fetch(image);
        const blob = await response.blob();

        // Gerar um nome único para a imagem
        const imageName = `${Date.now()}_${image.substring(image.lastIndexOf('/') + 1)}`;
        const storageRef = ref(storage, `images/${imageName}`);

        uploadBytes(storageRef, blob) // Vefiricar se a imagem foi enviada
            .then((snapshot) => {
                setLoading(false);
                console.log('Imagem enviada com sucesso para o Firebase Storage!');
                alert("Imagem enviada com sucesso!");
                clearInputs();
            }).catch((error) => {
                setLoading(false);
                console.log(error.message);
            });
    }

    const handleChange = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permissão negada para acessar a biblioteca de mídia');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        console.log('Resultado da seleção de imagem:', result);

        if (!result.cancelled && result.assets.length > 0) {
            const selectedImageUri = result.assets[0].uri; // Acessa o URI da primeira imagem selecionada
            setImage(selectedImageUri);
            setImagePreview(selectedImageUri); // Define a imagem selecionada como imagem de pré-visualização
            console.log('URI da imagem selecionada:', selectedImageUri);
        }


    }

    return (
        <Animatable.View animation='fadeInUp' style={styles.container}>
            <Text style={styles.title}>Enviar imagem para nuvem</Text>
            <StatusBar style="auto" />

            {imagePreview ? (
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
                <TouchableOpacity style={styles.imageContainer} onPress={handleChange}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image" size={50} color="gray" />
                        <Text>Selecionar uma imagem</Text>
                    </View>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.clearButton} onPress={clearInputs}>
                <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton} onPress={submitData}>
                <Text style={styles.sendTextButton}>Enviar</Text>
            </TouchableOpacity>

            <Spinner visible={loading} textContent={'Enviando...'} textStyle={styles.loadingText} />

        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#E5EAF0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        marginBottom: 10
    },
    imagePreview: {
        width: 300,
        height: 300,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        width: 300,
        height: 300,
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#1A73E8',
        width: '30%',
        borderRadius: 20,
        paddingVertical: 8,
        marginTop: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendTextButton: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    clearButton: {
        marginTop: 15,
        marginBottom: 20,
        alignSelf: 'center',
    },
    clearButtonText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold'
    },
    loadingText: {
        color: '#fff',
    },
});
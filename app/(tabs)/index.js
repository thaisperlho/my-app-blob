import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';



export default function HomeScreen() {
  const [image, setImage] = useState(null);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled) {
        const uri = result.assets[0].uri;
        const userUri = await uploadImage(uri);
        console.info("Setando imagem" + userUri);
        setImage(userUri);
    }
};

const uploadImage = async (uri) => {
  console.log('Uploading image');
  const imageUri = uri;

  // Substitua pela sua URL base da conta de armazenamento e o token SAS
  const baseUrl = process.env.EXPO_PUBLIC_AZURE_STORAGE_URL;
  const sasToken = process.env.EXPO_PUBLIC_SAS_TOKEN;


  try {
      const extension = imageUri.split('.').pop();
      const mimeType = "image/" + extension;

      // Gera um novo nome para o arquivo
      const fileId = uuidv4() || 'invalid-file-id';
      const newFileName = fileId + '.' + extension;
      console.log("info: " + newFileName);
      const signedUrl = `${baseUrl}/${newFileName}?${sasToken}`;


      // const fileStats = await RNFS.stat(imageUri);
      const fileContent = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
      });
      console.log("info" + fileContent);

      const options = {
          headers: {
              'Content-Type': mimeType,
              'x-ms-blob-type': 'BlockBlob',
          },
      };

      const response = await axios.put(signedUrl, Buffer.from(fileContent, 'base64'), options);

      if (response.status === 201) {
          console.log('Success Image uploaded successfully');
      } else {
          console.log('Error Image upload failed');
      }
      return signedUrl;
  } catch (err) {
      console.log('Error Unknown error: ' + err);
  }
};
  
    return (
      <View style={styles.container}>
        <Button title="Escolha uma imagem" onPress={pickImage} style={styles.button}  />
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
    );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  button: {
    marginVertical: 20,
    backgroundColor: 'blue',
  },
});

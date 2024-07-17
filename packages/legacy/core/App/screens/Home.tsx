import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const Home = () => {
  const handlePress = (buttonNumber: number) => {
    Alert.alert(`Button ${buttonNumber} pressed!`)
    // Add navigation logic here
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      margin: 10,
    },
    buttonContainer: {
      flex: 1,
      margin: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      height: 250,
    },
    buttonText: {
      fontSize: 22,
      color: 'black',
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(1)}>
          <Icon name="wallet-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Credentials</Text>
        </TouchableOpacity>
        {/* card-account-details-outline */}
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(2)}>
          <Icon name="bluetooth" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Bluetooth</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(3)}>
          <Icon name="qrcode" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Generate QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(4)}>
          <Icon name="bell-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(5)}>
          <Icon name="contacts-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(6)}>
          <Icon name="domain" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Infrastructure</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(7)}>
          <Icon name="alert-circle-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => handlePress(8)}>
          <Icon name="cogs" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        {/* cog-outline */}
      </View>
    </View>
  )
}

export default Home

import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useConfiguration } from '../contexts/configuration'
import { Screens, Stacks } from '../types/navigators'

const Home = () => {
  const navigation = useNavigation()
  const { useCustomNotifications } = useConfiguration()
  const { total } = useCustomNotifications()

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
      position: 'relative',
    },
    buttonText: {
      fontSize: 22,
      color: 'black',
    },
    badgeContainer: {
      position: 'absolute',
      top: '25%',
      right: '40%',
      backgroundColor: 'red',
      width: 30,
      height: 30,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  })

  const navigateToScreen = (stack: Stacks, screen: Screens, params = {}) => {
    navigation.getParent()?.navigate(stack, { screen, params })
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.CredentialStack, Screens.Credentials)}
        >
          <Icon name="wallet-outline" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Credentials</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.ContactStack, Screens.ScanBLE)}
        >
          <Icon name="bluetooth" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Bluetooth</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.ContactStack, Screens.QRCodeGen)}
        >
          <Icon name="qrcode" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>QR Generator</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.NotificationStack, Screens.Notification)}
        >
          <Icon name="bell-outline" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Notifications</Text>
          {total != 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{total > 9 ? '9+' : total}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.ContactStack, Screens.Contacts, { navigation })}
        >
          <Icon name="car" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() =>
            navigateToScreen(Stacks.ContactStack, Screens.Contacts, { navigation, serviceName: 'Infrastructures' })
          }
        >
          <Icon name="radio-tower" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Infrastructures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.SettingStack, Screens.Onboarding, { pageName: 'About' })}
        >
          <Icon name="information-outline" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigateToScreen(Stacks.SettingStack, Screens.Settings)}
        >
          <Icon name="cog" color="#1C6DA5" size={100} />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Home

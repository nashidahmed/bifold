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
      // top: 5,
      // right: 5,
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

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.CredentialStack, { screen: Screens.Credentials })}
        >
          <Icon name="wallet-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Credentials</Text>
        </TouchableOpacity>
        {/* card-account-details-outline */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.ScanBLE })}
        >
          <Icon name="bluetooth" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Bluetooth</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.QRCodeGen })}
        >
          <Icon name="qrcode" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Generate QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.NotificationStack, { screen: Screens.Notification })}
        >
          <Icon name="bell-outline" color="#1C6DA5" size={80} />
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
          onPress={() =>
            navigation
              .getParent()
              ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } })
          }
        >
          <Icon name="car" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() =>
            navigation.getParent()?.navigate(Stacks.ContactStack, {
              screen: Screens.Contacts,
              params: { navigation: navigation, serviceName: 'Infrastructure' },
            })
          }
        >
          <Icon name="domain" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Infrastructure</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.QRCodeGen })}
        >
          <Icon name="alert-circle-outline" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.getParent()?.navigate(Stacks.SettingStack, { screen: Screens.Settings })}
        >
          <Icon name="cogs" color="#1C6DA5" size={80} />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        {/* cog-outline */}
      </View>
    </View>
  )
}

export default Home

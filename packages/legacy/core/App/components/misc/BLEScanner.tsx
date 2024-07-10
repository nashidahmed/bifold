/* eslint-disable no-console */
import { DidExchangeState } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  NativeEventEmitter,
  NativeModules,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native'
import BleManager from 'react-native-ble-manager'
import { SafeAreaView } from 'react-native-safe-area-context'

import ButtonLoading from '../../components/animated/ButtonLoading'
import ConnectionLoading from '../../components/animated/ConnectionLoading'
import Button, { ButtonType } from '../../components/buttons/Button'
import { domain } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { useConnectionByOutOfBandId } from '../../hooks/connections'
import { ScanProps } from '../../screens/Scan'
import { Stacks, Screens } from '../../types/navigators'
import { createConnectionInvitation, stringToBytes } from '../../utils/helpers'
import { handleInvitation } from '../../utils/invitation'

const { BleAdvertise } = NativeModules

// Define the local device interface for TypeScript
interface LocalDevice {
  id: string
  name?: string
  rssi?: number
  advertising?: Advertising
}

interface Advertising {
  serviceUUIDs: string[]
}

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  device: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontWeight: 'bold',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 20,
  },
})

const BLEScanner: React.FC<ScanProps> = ({ navigation, route }) => {
  const [isScanning, setIsScanning] = useState(true)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const [devices, setDevices] = useState<LocalDevice[]>([])
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean>(false)
  const [appState, setAppState] = useState(AppState.currentState)
  const [connectedDeviceId, setConnectedDeviceId] = useState<string>()
  const { TextTheme } = useTheme()
  const bleManagerModule = NativeModules.BleManager
  const bleManagerEmitter = new NativeEventEmitter(bleManagerModule)
  const bleAdvertiseEmitter = new NativeEventEmitter(NativeModules.BleAdvertise)
  const { agent } = useAgent()
  const { t } = useTranslation()
  const isFocused = useIsFocused()

  const record = useConnectionByOutOfBandId(recordId || '')
  const uuid = '1357d860-1eb6-11ef-9e35-0800200c9a66'
  const cuuid = 'd918d942-8516-4165-922f-dd6823d32b2f'
  let receivedInvitation = ''

  BleAdvertise.setCompanyId(0x00e0)

  const handleBleManagerDidUpdateState = (args: { state: string }) => {
    if (args.state === 'on') {
      setIsBluetoothEnabled(true)
    } else {
      setIsBluetoothEnabled(false)
    }
  }

  const handleDiscoverPeripheral = (peripheral: LocalDevice) => {
    console.log(peripheral)
    if (peripheral && peripheral.id && peripheral.name) {
      setDevices((prevDevices) => {
        const deviceExists = prevDevices.some((device) => device.id === peripheral.id)
        if (!deviceExists) console.log(peripheral)
        return deviceExists
          ? prevDevices
          : [...prevDevices, { id: peripheral.id, name: peripheral.name, rssi: peripheral.rssi }]
      })
    }
  }

  const handleRead = async ({ data }: { data: string }) => {
    setIsConnecting(true)
    console.log('Received data from', cuuid, 'in service', uuid)
    console.log('Data:', data)

    receivedInvitation += data

    if (data.includes('\n')) {
      receivedInvitation.replace('\n', '')
      await handleInvitation(navigation, route, agent, receivedInvitation)
    }
  }

  const startAdvertising = async () => {
    try {
      BleAdvertise.broadcast(uuid, cuuid, {})
        .then((success: any) => {
          console.log(success)
        })
        .catch((error: string) => {
          console.log('broadcast failed with: ' + error)
        })
    } catch (error) {
      console.log('Broadcast failed with: ' + error)
      Alert.alert('Broadcast Failed', `Failed to start broadcasting: ${error}`)
    }
  }

  // Stop advertising BLE
  const stopAdvertising = async () => {
    try {
      await BleAdvertise.stopBroadcast()
      console.log('Stopped advertising')
    } catch (error) {
      console.error('Failed to stop advertising:', error)
    }
  }

  // Scan for other BLE connections, use a custom UUID so only devices advertising through the app are visible.
  const startScan = async () => {
    setDevices([]) // Clear devices list before scanning
    BleManager.scan([uuid], 10, true)
      .then(() => {
        setIsScanning(true)
      })
      .catch((err: any) => {
        console.error('Scan failed', err)
        setIsScanning(false)
      })
  }

  const disconnectDevice = (deviceId: string) => {
    BleManager.disconnect(deviceId)
      .then(() => {
        // Success code
        console.log('Disconnected')
      })
      .catch((error) => {
        // Failure code
        console.log(error)
      })
  }

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch((error) => {
      console.error('BleManager initialization error:', error)
    })

    const stopListener = bleManagerEmitter.addListener('BleManagerStopScan', () => {
      setIsScanning(false)
      console.log('Scan is stopped')
    })

    const updateListener = bleManagerEmitter.addListener('BleManagerDidUpdateState', handleBleManagerDidUpdateState)
    const discoverListener = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)
    const readListener = bleAdvertiseEmitter.addListener('onRead', handleRead)
    BleManager.checkState()
    startAdvertising()
    startScan()

    return () => {
      updateListener.remove()
      stopListener.remove()
      discoverListener.remove()
      readListener.remove()
    }
  }, [])

  useEffect(() => {
    console.log(record)
    if (record?.state === DidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: record.id },
      })
    }
  }, [record])

  // When app is pushed to the background, stop advertising
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        stopAdvertising()
      } else {
        startAdvertising()
      }
      setAppState(nextAppState)
    }

    const appStateListener = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      appStateListener.remove()
    }
  }, [appState])

  // When screen is unfocused, stop advertising
  useEffect(() => {
    if (!isFocused) {
      stopAdvertising()
      connectedDeviceId && disconnectDevice(connectedDeviceId)
    } else {
      startAdvertising()
    }
  }, [isFocused])

  const createInvitation = async (): Promise<string> => {
    const result = await createConnectionInvitation(agent)
    setRecordId(result.record.id)
    return result.record.outOfBandInvitation.toUrl({ domain }) + '\n' // Add delimiter \n to detect completion in bluetooth send
  }

  const sendInvitation = async (deviceId: string) => {
    const invitationURL = await createInvitation()

    console.log(invitationURL)
    await BleManager.write(deviceId, uuid, cuuid, stringToBytes(invitationURL))
      .then(() => {
        console.log('Invitation URL sent successfully')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const connectToDevice = (deviceId: string) => {
    setIsConnecting(true)
    setConnectedDeviceId(deviceId)
    BleManager.connect(deviceId)
      .then(async () => {
        console.log('Connected to', deviceId)
        return BleManager.retrieveServices(deviceId)
      })
      .then(async (peripheralInfo) => {
        console.log('Peripheral info:', peripheralInfo)
        return sendInvitation(deviceId)
      })
      .catch((err: any) => {
        setIsConnecting(false)
        console.error('Connection failed', err)
        Alert.alert('Connection Failed', `Failed to connect to device ${deviceId}`)
      })
  }

  const renderItem = ({ item }: { item: LocalDevice }) => (
    <View style={styles.device}>
      <Text style={[TextTheme.title]}>{item.name}</Text>
      <Button title="Connect" onPress={() => connectToDevice(item.id)} buttonType={ButtonType.Secondary} />
    </View>
  )

  if (!isBluetoothEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ marginBottom: 10, alignContent: 'center' }}>
          <Text style={[TextTheme.bold]}>{t('ScanBLE.BluetoothText')}</Text>
        </View>
      </SafeAreaView>
    )
  } else if (isConnecting) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
        <ConnectionLoading />
      </SafeAreaView>
    )
  } else {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={{ marginBottom: 10 }}>
          <Text style={[TextTheme.normal]}>{t('ScanBLE.Text1')}</Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={[TextTheme.label]}>{t('ScanBLE.Text2')}</Text>
        </View>
        {!isScanning && devices.length === 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={[TextTheme.labelSubtitle, styles.noDevicesText]}>{t('ScanBLE.Text3')}</Text>
          </View>
        )}
        <FlatList data={devices} renderItem={renderItem} keyExtractor={(item) => item.id} />
        <Button
          title={t('ScanBLE.ScanDevices')}
          onPress={startScan}
          disabled={isScanning}
          buttonType={ButtonType.Primary}
        >
          {isScanning && <ButtonLoading />}
        </Button>
      </SafeAreaView>
    )
  }
}

export default BLEScanner

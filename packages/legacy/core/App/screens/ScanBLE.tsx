import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import {
  PERMISSIONS,
  Permission,
  RESULTS,
  Rationale,
  check,
  checkMultiple,
  request,
  requestMultiple,
} from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import BLEScanner from '../components/misc/BLEScanner'
import PermissionDisclosureModal, { DisclosureTypes } from '../components/modals/PermissionDisclosureModal'
import { ToastType } from '../components/toast/BaseToast'
import LoadingView from '../components/views/LoadingView'
import { MultiplePermissionContract, PermissionContract } from '../types/permissions'

import { ScanProps } from './Scan'

const ScanBLE: React.FC<ScanProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [disclosureType, setDisclosureType] = useState<DisclosureTypes>(
    Platform.OS === 'android' ? 'NearbyDevicesDisclosure' : 'BluetoothDisclosure'
  )
  const { t } = useTranslation()

  const permissionFlow = async (
    method: PermissionContract,
    permission: Permission,
    rationale?: Rationale
  ): Promise<boolean> => {
    try {
      const permissionResult = await method(permission, rationale)
      if (permissionResult === RESULTS.GRANTED) {
        setShowDisclosureModal(false)
        return true
      }
    } catch (error: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (error as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    return false
  }

  const multiplePermissionFlow = async (
    method: MultiplePermissionContract,
    permission: Permission[],
    rationale?: Rationale
  ): Promise<boolean> => {
    try {
      const permissionResult = await method(permission, rationale)
      const allPermissionsGranted = Object.values(permissionResult).every(
        (permission) => permission === RESULTS.GRANTED
      )

      if (allPermissionsGranted) {
        setShowDisclosureModal(false)
        return true
      }
    } catch (error: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (error as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    return false
  }

  useEffect(() => {
    const asyncEffect = async () => {
      if (Platform.OS === 'android') {
        const isAndroid12OrAbove = Platform.Version >= 31

        const permissions = [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        ]

        setDisclosureType(isAndroid12OrAbove ? 'NearbyDevicesDisclosure' : 'LocationDisclosure')
        await multiplePermissionFlow(checkMultiple, permissions)
      } else if (Platform.OS === 'ios') {
        await permissionFlow(check, PERMISSIONS.IOS.BLUETOOTH)
      }
      setLoading(false)
    }

    asyncEffect()
  }, [])

  const requestBLEUse = async (rationale?: Rationale): Promise<boolean> => {
    if (Platform.OS === 'android') {
      // const isAndroid12OrAbove = Platform.Version >= 31

      const permissions = [
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      ]

      return await multiplePermissionFlow(requestMultiple, permissions, rationale)
    } else if (Platform.OS === 'ios') {
      return await permissionFlow(request, PERMISSIONS.IOS.BLUETOOTH, rationale)
    }

    return false
  }

  if (loading) {
    return <LoadingView />
  }

  if (showDisclosureModal) {
    return <PermissionDisclosureModal requestUse={requestBLEUse} type={disclosureType} />
  } else {
    return <BLEScanner navigation={navigation} route={route} />
  }
}

export default ScanBLE

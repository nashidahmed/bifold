import { CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { useIsFocused } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'

import CredentialCard from '../components/misc/CredentialCard'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { CredentialStackParams, Screens } from '../types/navigators'
import { TourID } from '../types/tour'

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const {
    credentialListOptions: CredentialListOptions,
    credentialEmptyList: CredentialEmptyList,
    enableTours: enableToursConfig,
  } = useConfiguration()
  const receivedCredentials = useCredentialByState(CredentialState.CredentialReceived)
  const doneCredentials = useCredentialByState(CredentialState.Done)

  const credentials = useMemo(() => {
    return [...receivedCredentials, ...doneCredentials].sort(
      (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
    )
  }, [receivedCredentials, doneCredentials])

  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  const { ColorPallet } = useTheme()
  const [store, dispatch] = useStore()
  const { start, stop } = useTour()
  const screenIsFocused = useIsFocused()

  useEffect(() => {
    const shouldShowTour = enableToursConfig && store.tours.enableTours && !store.tours.seenCredentialsTour

    if (shouldShowTour && screenIsFocused) {
      start(TourID.CredentialsTour)
      dispatch({
        type: DispatchAction.UPDATE_SEEN_CREDENTIALS_TOUR,
        payload: [true],
      })
    }

    return stop
  }, [
    screenIsFocused,
    enableToursConfig,
    store.tours.enableTours,
    store.tours.seenCredentialsTour,
    start,
    stop,
    dispatch,
  ])

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 15,
      marginTop: 15,
    },
    itemContainer: {
      flex: 1,
      margin: 5,
    },
  })

  return (
    <View>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={credentials}
        keyExtractor={(credential) => credential.id}
        numColumns={2}
        renderItem={({ item: credential, index }) => (
          <View
            style={[
              styles.container,
              styles.itemContainer,
              { marginBottom: index === credentials.length - 1 ? 45 : 0 },
            ]}
          >
            <CredentialCard
              credential={credential}
              onPress={() => navigation.navigate(Screens.CredentialDetails, { credential })}
            />
          </View>
        )}
        ListEmptyComponent={() => <CredentialEmptyList message={t('Credentials.EmptyList')} />}
      />
      <CredentialListOptions />
    </View>
  )
}

export default ListCredentials

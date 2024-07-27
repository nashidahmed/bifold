import { ConnectionRecord, ConnectionType } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import ContactListItem from '../components/listItems/ContactListItem'
import EmptyListContacts from '../components/misc/EmptyListContacts'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

interface ListContactsProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
  route: RouteProp<ContactStackParams, Screens.Contacts>
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation, route }) => {
  let serviceName = ''
  if (route && route.params && route.params.serviceName) {
    serviceName = route.params.serviceName
  }
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const style = StyleSheet.create({
    list: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    itemSeparator: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      height: 1,
      marginHorizontal: 16,
    },
  })
  const { records } = useConnections()
  const [store] = useStore()
  // Filter out mediator agents
  let connections: ConnectionRecord[] = records
  if (!store.preferences.developerModeEnabled) {
    if (serviceName == 'Infrastructures') {
      connections = records.filter((r) => [...store.agent.infrastructure].includes(r.id))
    } else if (serviceName == 'CA') {
      connections = records.filter((r) => [...store.agent.ca].includes(r.id))
    } else {
      connections = records.filter(
        (r) =>
          !r.connectionTypes.includes(ConnectionType.Mediator) &&
          ![...store.agent.infrastructure, ...store.agent.ca].includes(r.id)
      )
    }
  }

  // Sort connections by updatedAt
  connections.sort((a, b) => {
    // Convert updatedAt to Date objects, handling potential undefined values
    const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0)
    const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0)

    // Compare dates
    return dateB.getTime() - dateA.getTime()
  })

  const onPressAddContact = () => {
    navigation.getParent()?.navigate(Stacks.ConnectStack, { screen: Screens.Scan, params: { defaultToConnect: true } })
  }

  useEffect(() => {
    if (store.preferences.useConnectionInviterCapability) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton
            buttonLocation={ButtonLocation.Right}
            accessibilityLabel={t('Contacts.AddContact')}
            testID={testIdWithKey('AddContact')}
            onPress={onPressAddContact}
            icon="plus-circle-outline"
          />
        ),
      })
    } else {
      navigation.setOptions({
        headerRight: () => false,
      })
    }
  }, [store.preferences.useConnectionInviterCapability])

  return serviceName == 'Infrastructures' ? (
    <View>
      {/* <View style={{ padding: 20 }}>
        <Text style={[TextTheme.label]}>{t('Contacts.'Infrastructure')}</Text>
      </View> */}
      <FlatList
        style={style.list}
        data={connections.filter((r) => store.agent.infrastructure.includes(r.id))}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => (
          <ContactListItem contact={connection} navigation={navigation} serviceName="Infrastructures" />
        )}
        ListEmptyComponent={() => <EmptyListContacts serviceName="infrastructure" />}
      />
    </View>
  ) : serviceName == 'CA' ? (
    <View>
      {/* <View style={{ padding: 20 }}>
        <Text style={[TextTheme.label]}>{t('Contacts.CA')}</Text>
      </View> */}
      <FlatList
        style={style.list}
        data={connections.filter((r) => store.agent.ca.includes(r.id))}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => (
          <ContactListItem contact={connection} navigation={navigation} serviceName="CA" />
        )}
        ListEmptyComponent={() => <EmptyListContacts serviceName="CA" />}
      />
    </View>
  ) : (
    <View>
      <FlatList
        style={style.list}
        data={connections}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => (
          <ContactListItem contact={connection} navigation={navigation} serviceName="" />
        )}
        ListEmptyComponent={() => <EmptyListContacts serviceName="vehicle" />}
      />
    </View>
  )
}

export default ListContacts

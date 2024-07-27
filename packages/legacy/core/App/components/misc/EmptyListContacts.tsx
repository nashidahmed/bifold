import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

export interface EmptyListProps {
  serviceName: string
}

const EmptyListContacts: React.FC<EmptyListProps> = ({ serviceName }) => {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ListItems, Assets, ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      paddingTop: 250,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    text: {
      textAlign: 'center',
      marginTop: 10,
    },
    link: {
      textAlign: 'center',
      marginTop: 10,
      alignSelf: 'center',
    },
  })

  return (
    <View style={styles.container}>
      {/* <Assets.svg.contactBook fill={ListItems.emptyList.color} height={120} /> */}
      {/* <Text style={[TextTheme.headingThree, styles.text, { marginTop: 30 }]}>{t('Contacts.EmptyList')}</Text> */}
      <Text style={[TextTheme.headingThree, styles.text, { marginTop: 30 }]}> Your {serviceName}'s list is empty</Text>
      <Text style={[ListItems.emptyList, styles.text]}>{t('Contacts.PeopleAndOrganizations')}</Text>
    </View>
  )
}

export default EmptyListContacts

import { Field } from '@hyperledger/aries-oca/build/legacy'
import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'

export interface RecordProps {
  header?: () => React.ReactElement | null
  footer?: () => React.ReactElement | null
  fields: Field[]
  hideFieldValues?: boolean
  field?: (field: Field, index: number, fields: Field[]) => React.ReactElement | null
  isOffer?: boolean
}

const Record: React.FC<RecordProps> = ({
  header,
  footer,
  fields,
  hideFieldValues = false,
  field = null,
  isOffer = false,
}) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>(Array(fields.length).fill(false))
  const [showAll, setShowAll] = useState<boolean>(false)
  const { ListItems, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    linkContainer: {
      ...ListItems.recordContainer,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    link: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    infoBox: {
      width: '33%',
    },
    infoBoxWide: {
      width: '100%',
    },
  })

  const resetShown = useCallback((): void => {
    const newShownState = Array(fields.length).fill(!showAll)
    setShown(newShownState)
    setShowAll(!showAll)
  }, [fields.length, showAll])

  const toggleShownState = (index: number): void => {
    const newShowState = [...shown]
    newShowState[index] = !shown[index]
    setShown(newShowState)
  }

  useEffect(() => {
    const newShownState = Array(fields.length).fill(false)
    setShown(newShownState)
  }, [fields.length])

  const renderField = useCallback(
    (name: string, index: number) => {
      return (
        <View style={styles.infoBox} key={name}>
          {field
            ? fields.filter((item) => item.name === name).map((attr, idx) => field(attr, idx, fields))
            : fields
                .filter((item) => item.name === name)
                .map((attr) => (
                  <RecordField
                    key={attr.name}
                    field={attr}
                    hideFieldValue={hideFieldValues}
                    onToggleViewPressed={() => toggleShownState(index)}
                    shown={hideFieldValues ? shown[index] : true}
                    hideBottomBorder={index === fields.length - 1}
                  />
                ))}
        </View>
      )
    },
    [field, fields, hideFieldValues, shown, styles.infoBox, toggleShownState]
  )

  return (
    <>
      {header && (
        <RecordHeader>
          {header()}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {!isOffer && footer && <RecordFooter>{footer()}</RecordFooter>}
            {hideFieldValues && (
              <View style={styles.linkContainer}>
                <TouchableOpacity
                  style={styles.link}
                  activeOpacity={1}
                  onPress={resetShown}
                  testID={testIdWithKey('HideAll')}
                  accessible={true}
                  accessibilityLabel={showAll ? t('Record.HideAll') : t('Record.ShowAll')}
                >
                  <Text style={ListItems.recordLink}>{showAll ? t('Record.HideAll') : t('Record.ShowAll')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </RecordHeader>
      )}

      <View style={styles.infoRow}>
        {renderField('vin', 0)}
        {renderField('vehicle_information', 1)}
        {renderField('registration_number', 2)}
      </View>

      <View style={styles.infoRow}>
        {renderField('state_issued', 3)}
        {renderField('issued', 4)}
        {renderField('expiry_date', 5)}
      </View>

      <View style={styles.infoRow}>
        {renderField('photo_id', 6)}
        {renderField('vehicle_owner', 7)}
        {renderField('owner_address', 8)}
      </View>
      {isOffer && footer && <RecordFooter>{footer()}</RecordFooter>}
    </>
  )
}

export default Record

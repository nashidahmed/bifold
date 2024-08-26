import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

const RecordFooter: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      height: 'auto',
    },
  })
  return <View style={styles.container}>{children}</View>
}

export default RecordFooter

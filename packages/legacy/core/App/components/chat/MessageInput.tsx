import React from 'react'
import { Text, View } from 'react-native'
import { Composer, InputToolbar, Send } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'

export const renderInputToolbar = (props: any, theme: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      ...theme.inputToolbar,
      justifyContent: 'center',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
    }}
  />
)

export const renderComposer = (props: any, theme: any, placeholder: string) => (
  <Composer
    {...props}
    textInputStyle={{
      ...theme.inputText,
    }}
    placeholder={placeholder}
    placeholderTextColor={theme.placeholderText}
    // the placeholder is read by accessibility features when multiline is enabled so a label is not necessary (results in double announcing if used)
    textInputProps={{ accessibilityLabel: '' }}
  />
)

export const renderSend = (props: any, theme: any) => (
  <Send
    {...props}
    alwaysShowSend={true}
    disabled={!props.text}
    containerStyle={{
      ...theme.sendContainer,
    }}
  >
    <Icon name="send" size={38} color={props.text ? theme.sendEnabled : theme.sendDisabled} />
  </Send>
)

export const renderNotVerified = (props: any) => {
  const { ColorPallet, TextTheme } = useTheme()
  return (
    <View
      {...props}
      style={{
        height: 50,
        width: '100%',
        backgroundColor: ColorPallet.grayscale.lightGrey,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: TextTheme.normal.fontSize,
          color: ColorPallet.grayscale.black,
        }}
      >
        Both the sender and receiver must be verified before they can communicate with each other.
      </Text>
    </View>
  )
}

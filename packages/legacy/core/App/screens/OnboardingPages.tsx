/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native'
import { SvgProps } from 'react-native-svg'

import AboutCredential from '../assets/img/about-credential.svg'
import AboutUI from '../assets/img/about-ui.svg'
import CredentialList from '../assets/img/credential-list.svg'
import ScanShare from '../assets/img/scan-share.svg'
import SecureImage from '../assets/img/secure-image.svg'
import VehicleConnected from '../assets/img/vehicle-bluetooth.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { GenericFn } from '../types/fn'
import { OnboardingStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { OnboardingStyleSheet } from './Onboarding'

export const createCarouselStyle = (OnboardingTheme: any): OnboardingStyleSheet => {
  return StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      flex: 1,
      alignItems: 'center',
    },
    carouselContainer: {
      ...OnboardingTheme.carouselContainer,
      flexDirection: 'column',
    },
    pagerContainer: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
    },
    pagerDot: {
      ...OnboardingTheme.pagerDot,
      borderWidth: 1,
      borderStyle: 'solid',
    },
    pagerDotActive: {
      ...OnboardingTheme.pagerDotActive,
    },
    pagerDotInactive: {
      ...OnboardingTheme.pagerDotInactive,
    },
    pagerPosition: {
      position: 'relative',
      top: 0,
    },
    pagerNavigationButton: {
      ...OnboardingTheme.pagerNavigationButton,
    },
  })
}

export const createStyles = (OnboardingTheme: any) => {
  return StyleSheet.create({
    headerText: {
      ...OnboardingTheme.headerText,
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
    },
    point: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 20,
      marginTop: 10,
      marginRight: 20,
      marginBottom: 10,
    },
    icon: {
      marginRight: 10,
    },
  })
}

const createImageDisplayOptions = (OnboardingTheme: any) => {
  return {
    ...OnboardingTheme.imageDisplayOptions,
    height: 180,
    width: 180,
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 20,
  },
  text: {
    color: '#000',
    fontSize: 16,
    marginTop: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
})

const customPages = (onTutorialCompleted: GenericFn, OnboardingTheme: any) => {
  const { t } = useTranslation()
  const [store] = useStore()
  const navigation = useNavigation()
  // const styles = createStyles(OnboardingTheme)
  const imageDisplayOptions = createImageDisplayOptions(OnboardingTheme)

  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <VehicleConnected style={{ ...imageDisplayOptions }} />
      </View>
      <ScrollView style={styles.container}>
        {/* <Text style={styles.header}>Current Features</Text> */}
        <Text style={styles.subHeader}>User Interface for CarPlay:</Text>
        <Text style={styles.text}>
          Our app's user interface is optimized for tablet mode, specifically integrated with CarPlay systems in
          vehicles. This leverages the larger display size to improve the visibility and accessibility of information
          and controls, ensuring a safer and more engaging user experience.
        </Text>
        <Text style={styles.subHeader}>Bluetooth Connectivity:</Text>
        <Text style={styles.text}>
          The app's connectivity features include integrated Bluetooth technology for device pairing. This provides a
          seamless and secure method of connecting devices within the network, replacing the traditional QR code system
          and improving overall usability and safety.
        </Text>
        <Text style={styles.subHeader}>Continual Improvement:</Text>
        <Text style={styles.text}>
          We are committed to continually improving the app by incorporating user feedback and staying abreast of the
          latest technological advancements. Our goal is to make "FHWA Wallet" the leading solution for secure,
          efficient, and reliable vehicular communications.
        </Text>
      </ScrollView>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('Global.GetStarted')}
          accessibilityLabel={t('Global.GetStarted')}
          testID={testIdWithKey('GetStarted')}
          onPress={() =>
            store.onboarding.didCompleteTutorial
              ? navigation.getParent()?.navigate(Stacks.HomeStack, { screen: Screens.Home })
              : onTutorialCompleted()
          }
          buttonType={ButtonType.Primary}
        />
      </View>
    </>
  )
}

const guides = (OnboardingTheme: any): React.ReactElement[] => {
  const imageDisplayOptions = createImageDisplayOptions(OnboardingTheme)

  return [
    <>
      <View style={{ alignItems: 'center' }}>{<AboutCredential style={imageDisplayOptions} />}</View>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>About Our App</Text>
        <Text style={styles.subHeader}>Introduction:</Text>
        <Text style={styles.text}>
          Welcome to "FHWA Wallet." Our app is designed to enhance the safety, efficiency, and reliability of vehicular
          communications. By leveraging blockchain technology, Self-Sovereign Identity (SSI), and Decentralized
          Identifiers (DIDs), we provide a secure platform for vehicles to interact with each other and the surrounding
          infrastructure.
        </Text>
        <Text style={styles.subHeader}>Objectives:</Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Safety:</Text> Improve the security of vehicular communications to prevent
          unauthorized access and ensure data integrity.
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Efficiency:</Text> Streamline interactions between vehicles and infrastructure to
          reduce delays and enhance traffic management.
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Reliability:</Text> Provide a robust system that maintains functionality even in
          the face of potential network failures.
        </Text>
      </ScrollView>
    </>,
    <>
      <View style={{ alignItems: 'center' }}>{<AboutUI style={imageDisplayOptions} />}</View>
      <ScrollView style={styles.container}>
        {/* <Text style={styles.header}>Cutting-Edge Technology</Text> */}
        <Text style={styles.subHeader}>Blockchain Technology:</Text>
        <Text style={styles.text}>
          Our app utilizes a blockchain-based credential management system that ensures the security and privacy of
          communications. This decentralized approach minimizes the risk of central point failures and enhances the
          trustworthiness of vehicle interactions.
        </Text>
        <Text style={styles.subHeader}>Self-Sovereign Identity (SSI) and Decentralized Identifiers (DIDs):</Text>
        <Text style={styles.text}>
          SSI allows vehicles to manage their identities without relying on a central authority. Each vehicle is
          assigned a DID, which provides a unique, verifiable identity crucial for secure communications within the
          network.
        </Text>
        <Text style={styles.subHeader}>Key Features:</Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Secure Credentials:</Text> Vehicles can securely store and present their
          credentials, ensuring that only authorized entities can access sensitive information.
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Real-Time Interaction:</Text> The app supports real-time communication between
          vehicles (V2V),and vehicles and infrastructure (V2I).
        </Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>User-Friendly Interface:</Text> Developed using the React Native framework, our
          app provides a seamless and intuitive user experience, making it easy for users to manage and verify
          credentials on the go.
        </Text>
      </ScrollView>
    </>,
  ]
}

export const createPageWith = (
  PageImage: React.FC<SvgProps>,
  title: string,
  body: string,
  OnboardingTheme: any,
  devModeListener?: boolean,
  onDevModeTouched?: () => void
) => {
  const styles = createStyles(OnboardingTheme)
  const imageDisplayOptions = createImageDisplayOptions(OnboardingTheme)
  const titleElement = (
    <Text style={[styles.headerText, { fontSize: 18 }]} testID={testIdWithKey('HeaderText')}>
      {title}
    </Text>
  )
  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ alignItems: 'center' }}>{<PageImage style={imageDisplayOptions} />}</View>
      <View style={{ marginBottom: 20 }}>
        {devModeListener ? (
          <TouchableWithoutFeedback testID={testIdWithKey('DeveloperModeTouch')} onPress={onDevModeTouched}>
            {titleElement}
          </TouchableWithoutFeedback>
        ) : (
          titleElement
        )}
        <Text style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
          {body}
        </Text>
      </View>
    </ScrollView>
  )
}

const OnboardingPages = (onTutorialCompleted: GenericFn, OnboardingTheme: any): Array<Element> => {
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const [, dispatch] = useStore()
  const onDevModeEnabled = () => {
    dispatch({
      type: DispatchAction.ENABLE_DEVELOPER_MODE,
      payload: [true],
    })
    navigation.getParent()?.navigate(Screens.Developer)
  }
  const developerOptionCount = useRef(0)
  const touchCountToEnableBiometrics = 9

  const incrementDeveloperMenuCounter = () => {
    if (developerOptionCount.current >= touchCountToEnableBiometrics) {
      developerOptionCount.current = 0
      if (onDevModeEnabled) {
        onDevModeEnabled()
      }
      return
    }

    developerOptionCount.current = developerOptionCount.current + 1
  }
  return [...guides(OnboardingTheme), customPages(onTutorialCompleted, OnboardingTheme)]
}

export default OnboardingPages

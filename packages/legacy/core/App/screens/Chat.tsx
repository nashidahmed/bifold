import {
  // AutoAcceptProof,
  BasicMessageRecord,
  BasicMessageRepository,
  CredentialExchangeRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { useAgent, useBasicMessagesByConnectionId, useConnectionById } from '@aries-framework/react-hooks'
import { isPresentationReceived } from '@hyperledger/aries-bifold-verifier'
import { useIsFocused, useNavigation } from '@react-navigation/core'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { SafeAreaView } from 'react-native-safe-area-context'

import InfoIcon from '../components/buttons/InfoIcon'
import { renderComposer, renderInputToolbar, renderSend, renderNotVerified } from '../components/chat'
import ActionSlider from '../components/chat/ActionSlider'
import { renderActions } from '../components/chat/ChatActions'
import { ChatEvent } from '../components/chat/ChatEvent'
import { ChatMessage, ExtendedChatMessage, CallbackType } from '../components/chat/ChatMessage'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import { useNetwork } from '../contexts/network'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useCredentialsByConnectionId } from '../hooks/credentials'
import { useProofsByConnectionId } from '../hooks/proofs'
import { Role } from '../types/chat'
import { BasicMessageMetadata, basicMessageCustomMetadata } from '../types/metadata'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'
import {
  getConnectionName,
  getCredentialEventLabel,
  getCredentialEventRole,
  getMessageEventRole,
  getProofEventLabel,
  getProofEventRole,
} from '../utils/helpers'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat> | StackScreenProps<RootStackParams, Screens.Chat>

const Chat: React.FC<ChatProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('Chat route params were not set properly')
  }

  const { connectionId, serviceName = '' } = route.params
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()
  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)

  const credentials = useCredentialsByConnectionId(connectionId)
  const proofs = useProofsByConnectionId(connectionId)
  const isFocused = useIsFocused()
  const { assertConnectedNetwork /*, silentAssertConnectedNetwork */ } = useNetwork()
  const [messages, setMessages] = useState<Array<ExtendedChatMessage>>([])
  const [showActionSlider, setShowActionSlider] = useState(false)
  const { ChatTheme: theme, Assets } = useTheme()
  const { ColorPallet, TextTheme } = useTheme()
  const [theirLabel, setTheirLabel] = useState(getConnectionName(connection, store.preferences.alternateContactNames))

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const dispatchPRState = (category: string, connectionId: string) => {
    if (category === 'sent') {
      if (store.proofReq.sent.includes(connectionId)) return
      dispatch({
        type: DispatchAction.PR_Sent,
        payload: [connectionId],
      })
    } else if (category === 'received') {
      if (store.proofReq.received.includes(connectionId)) return
      dispatch({
        type: DispatchAction.PR_Received,
        payload: [connectionId],
      })
    }
  }

  useEffect(() => {
    setTheirLabel(getConnectionName(connection, store.preferences.alternateContactNames))
  }, [isFocused, connection, store.preferences.alternateContactNames])

  useMemo(() => {
    assertConnectedNetwork()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      title: theirLabel,
      headerRight: () => <InfoIcon connectionId={connection?.id as string} serviceName={serviceName} />,
    })
  }, [connection, theirLabel])

  // when chat is open, mark messages as seen
  useEffect(() => {
    basicMessages.forEach((msg) => {
      const meta = msg.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
      if (agent && !meta?.seen) {
        msg.metadata.set(BasicMessageMetadata.customMetadata, { ...meta, seen: true })
        const basicMessageRepository = agent.context.dependencyManager.resolve(BasicMessageRepository)
        basicMessageRepository.update(agent.context, msg)
      }
    })
  }, [basicMessages])

  useEffect(() => {
    const transformedMessages: Array<ExtendedChatMessage> = basicMessages.map((record: BasicMessageRecord, index) => {
      const role = getMessageEventRole(record)
      // eslint-disable-next-line
      const linkRegex = /(?:https?\:\/\/\w+(?:\.\w+)+\S*)|(?:[\w\d\.\_\-]+@\w+(?:\.\w+)+)/gm
      // eslint-disable-next-line
      const mailRegex = /^[\w\d\.\_\-]+@\w+(?:\.\w+)+$/gm
      const links = record.content.match(linkRegex) ?? []
      const handleLinkPress = (link: string) => {
        if (link.match(mailRegex)) {
          link = 'mailto:' + link
        }
        Linking.openURL(link)
      }
      const msgText = (
        <Text style={role === Role.me ? theme.rightText : theme.leftText}>
          {record.content.split(linkRegex).map((split, i) => {
            if (i < links.length) {
              const link = links[i]
              return (
                <React.Fragment key={i}>
                  <Text>{split}</Text>
                  <Text
                    onPress={() => handleLinkPress(link)}
                    style={{ color: ColorPallet.brand.link, textDecorationLine: 'underline' }}
                    accessibilityRole={'link'}
                  >
                    {link}
                  </Text>
                </React.Fragment>
              )
            }
            return <Text key={i}>{split}</Text>
          })}
        </Text>
      )

      return {
        _id: record.id || index.toString(),
        text: record.content,
        renderEvent: () => msgText,
        createdAt: record.updatedAt || record.createdAt,
        type: record.type,
        user: { _id: role },
      }
    })

    const callbackTypeForMessage = (record: CredentialExchangeRecord | ProofExchangeRecord) => {
      if (
        record instanceof CredentialExchangeRecord &&
        (record.state === CredentialState.Done || record.state === CredentialState.OfferReceived)
      ) {
        return CallbackType.CredentialOffer
      }

      if (
        (record instanceof ProofExchangeRecord && isPresentationReceived(record) && record.isVerified !== undefined) ||
        record.state === ProofState.RequestReceived ||
        (record.state === ProofState.Done && record.isVerified === undefined)
      ) {
        return CallbackType.ProofRequest
      }

      if (
        record instanceof ProofExchangeRecord &&
        (record.state === ProofState.PresentationSent || record.state === ProofState.Done)
      ) {
        return CallbackType.PresentationSent
      }
    }

    transformedMessages.push(
      ...credentials.map((record: CredentialExchangeRecord, index) => {
        const role = getCredentialEventRole(record)
        const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
        const actionLabel = t(getCredentialEventLabel(record) as any)

        return {
          _id: record.id || `credential-${index}`,
          text: actionLabel,
          renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
          createdAt: record.updatedAt || record.createdAt,
          type: record.type,
          user: { _id: role },
          messageOpensCallbackType: callbackTypeForMessage(record),
          onDetails: () => {
            const navMap: { [key in CredentialState]?: () => void } = {
              [CredentialState.Done]: () => {
                navigation.navigate(Stacks.ContactStack as any, {
                  screen: Screens.CredentialDetails,
                  params: { credential: record },
                })
              },
              [CredentialState.OfferReceived]: () => {
                navigation.navigate(Stacks.ContactStack as any, {
                  screen: Screens.CredentialOffer,
                  params: { credentialId: record.id },
                })
              },
            }
            const nav = navMap[record.state]
            if (nav) {
              nav()
            }
          },
        }
      })
    )

    transformedMessages.push(
      ...proofs.map((record: ProofExchangeRecord, index) => {
        const role = getProofEventRole(record)
        const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
        const actionLabel = t(getProofEventLabel(record) as any)
        if (getProofEventLabel(record) == 'Chat.ProofPresentationReceived') {
          dispatchPRState('received', record.connectionId as string)
        } else if (getProofEventLabel(record) == 'Chat.ProofRequestSatisfied') {
          dispatchPRState('sent', record.connectionId as string)
        }
        return {
          _id: record.id || `proof-${index}`,
          text: actionLabel,
          renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
          createdAt: record.updatedAt || record.createdAt,
          type: record.type,
          user: { _id: role },
          messageOpensCallbackType: callbackTypeForMessage(record),
          onDetails: () => {
            const toProofDetails = () => {
              navigation.navigate(Stacks.ContactStack as any, {
                screen: Screens.ProofDetails,
                params: {
                  recordId: record.id,
                  isHistory: true,
                  senderReview:
                    record.state === ProofState.PresentationSent ||
                    (record.state === ProofState.Done && record.isVerified === undefined),
                },
              })
            }
            const navMap: { [key in ProofState]?: () => void } = {
              [ProofState.Done]: toProofDetails,
              [ProofState.PresentationSent]: toProofDetails,
              [ProofState.PresentationReceived]: toProofDetails,
              [ProofState.RequestReceived]: () => {
                navigation.navigate(Stacks.ContactStack as any, {
                  screen: Screens.ProofRequest,
                  params: { proofId: record.id },
                })
              },
            }
            const nav = navMap[record.state]
            if (nav) {
              nav()
            }
          },
        }
      })
    )

    const connectedMessage = connection
      ? {
          _id: 'connected',
          text: `${t('Chat.YouConnected')} ${theirLabel}`,
          renderEvent: () => (
            <Text style={theme.rightText}>
              {t('Chat.YouConnected')}
              <Text style={[theme.rightText, theme.rightTextHighlighted]}> {theirLabel}</Text>
            </Text>
          ),
          createdAt: connection.createdAt,
          user: { _id: Role.me },
        }
      : undefined

    setMessages(
      connectedMessage
        ? [...transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt), connectedMessage]
        : transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt)
    )
  }, [basicMessages, credentials, proofs, theirLabel])

  // const sendProof = useCallback(() => {
  //   if (proofSentRef.current || !sendPR) return
  //   proofSentRef.current = true
  //   sendProofRequest(
  //     agent,
  //     useProofRequestTemplates(false, ['vehicle_information', 'vehicle_owner', 'state_issued'])[0],
  //     connectionId,
  //     {}
  //     // AutoAcceptProof.Always
  //   ).then((result) => {
  //     if (result?.proofRecord) linkProofWithTemplate(agent, result.proofRecord, '1')
  //   })
  // }, [sendPR, agent, connectionId])

  // useEffect(() => {
  //   if (!proofSentRef.current) {
  //     sendProof()
  //   }
  // }, [])

  const onSend = useCallback(
    async (messages: IMessage[]) => {
      await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
    },
    [agent, connectionId]
  )

  const onSendRequest = useCallback(async () => {
    navigation.navigate(Stacks.ProofRequestsStack as any, {
      // screen: Screens.ProofRequests,
      screen: Screens.SelectProofRequest,
      params: { navigation: navigation, connectionId },
    })
  }, [navigation, connectionId])

  const actions = useMemo(() => {
    return [
      {
        text: t('Verifier.SendProofRequest'),
        onPress: () => {
          setShowActionSlider(false)
          onSendRequest()
        },
        icon: () => <Assets.svg.iconInfoSentDark height={30} width={30} />,
      },
    ]
  }, [t, store.preferences.useVerifierCapability, onSendRequest])

  const onDismiss = () => {
    setShowActionSlider(false)
  }

  const [displayNotification, setDisplayNotification] = useState(false)
  const style = StyleSheet.create({
    modalText: {
      ...TextTheme.modalNormal,
      marginVertical: 5,
    },
  })

  useEffect(() => {
    if (serviceName == 'infrastructure') {
      const timer = setTimeout(() => {
        setDisplayNotification(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [serviceName])

  const checkVerified = (connectionId: string) => {
    return store.proofReq.sent.includes(connectionId) && store.proofReq.received.includes(connectionId)
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, paddingTop: 20 }}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        alignTop
        renderAvatar={() => null}
        messageIdGenerator={(msg) => msg?._id.toString() || '0'}
        renderMessage={(props) => <ChatMessage key={props.currentMessage?._id} messageProps={props} />}
        renderInputToolbar={(props) =>
          !checkVerified(connectionId) ? renderNotVerified(props) : renderInputToolbar(props, theme)
        }
        renderSend={(props) => renderSend(props, theme)}
        renderComposer={(props) => renderComposer(props, theme, t('Contacts.TypeHere'))}
        disableComposer={!checkVerified(connectionId)}
        onSend={onSend}
        user={{
          _id: Role.me,
        }}
        renderActions={(props) => renderActions(props, theme, actions)}
        onPressActionButton={actions ? () => setShowActionSlider(true) : undefined}
      />
      {displayNotification && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title="Verification Done"
          bodyContent={
            <View>
              <Text style={style.modalText}>You're credential is verified by the infrastructure</Text>
            </View>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => {
            setDisplayNotification(false)
          }}
        />
      )}
      {showActionSlider && <ActionSlider onDismiss={onDismiss} actions={actions} />}
    </SafeAreaView>
  )
}

export default Chat

// ** React Imports
import { Fragment, ReactNode, useContext, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Badge from '@mui/material/Badge'
import MuiAvatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'
import BlockHelper from 'mdi-material-ui/BlockHelper'
import StarOutline from 'mdi-material-ui/StarOutline'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import PhoneOutline from 'mdi-material-ui/PhoneOutline'
import ListStatus from 'mdi-material-ui/ListStatus'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'
import BookmarkOutline from 'mdi-material-ui/BookmarkOutline'
import ClockTimeFiveOutline from 'mdi-material-ui/ClockTimeFiveOutline'
import OfflineIcon from '@mui/icons-material/WifiOff'
import AwayIcon from '@mui/icons-material/DirectionsRun'
import BusyIcon from '@mui/icons-material/EventBusy'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import Available from '@mui/icons-material/CheckCircleOutline'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Type
import { ChatsObj, SelectedChatType, UserProfileRightType } from 'src/types/apps/chatTypes'

// ** Custom Component Imports
import Sidebar from 'src/@core/components/sidebar'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { Tooltip, useTheme } from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { useDispatch } from 'react-redux'
import {
  blockChannelChat,
  blockChat,
  deleteChannelChat,
  deleteChat,
  fetchChatsContacts,
  selectChat,
  startConversation
} from 'src/store/apps/chat'
import { AppDispatch } from 'src/store'
import { useRouter } from 'next/router'
import { chatService } from 'src/services'
import { SocketContext } from 'src/context/SocketContext'
import toast from 'react-hot-toast'

export const handleBlockSelectedChat = (
  selectedChat: SelectedChatType,
  handleUserProfileRightSidebarToggle: () => void,
  dispatch: AppDispatch,
  pathname?: string,
  channelId?: string
) => {
  if (pathname && pathname === '/channels/[id]/chat') {
    dispatch(
      blockChannelChat({
        channelId,
        id: selectedChat?.id as string,
        blockedUser: {
          blockedUserId: selectedChat?.blockedUserId,
          status: selectedChat?.status === 'BLOCK' ? 'UNBLOCK' : 'BLOCK'
        }
      })
    ).then(({ payload }) => {
      if (payload?.statusCode === '10000') {
        handleUserProfileRightSidebarToggle()
      }
    })
  } else {
    dispatch(
      blockChat({
        id: selectedChat?.id as string,
        blockedUser: {
          blockedUserId: selectedChat?.blockedUserId,
          status: selectedChat?.status === 'BLOCK' ? 'UNBLOCK' : 'BLOCK'
        }
      })
    ).then(({ payload }) => {
      if (payload?.statusCode === '10000') {
        handleUserProfileRightSidebarToggle()
      }
    })
  }
}

const UserProfileRight = (props: UserProfileRightType) => {
  const {
    store,
    hidden,
    statusObj,
    getInitials,
    sidebarWidth,
    userProfileRightOpen,
    handleUserProfileRightSidebarToggle
  } = props

  const ScrollWrapper = ({ children }: { children: ReactNode }) => {
    if (hidden) {
      return <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
    }
  }

  const {
    palette: {
      customColors: { blue }
    }
  } = useTheme()

  const { user } = useAuth()

  const dispatch = useDispatch<AppDispatch>()

  const [userStatus, setUserStatus] = useState<'OFFLINE' | 'AWAY' | 'BUSY' | 'DO_NOT_DISTURB' | 'AVAILABLE'>()

  const { socket } = useContext(SocketContext)

  const {
    pathname,
    query: { id }
  } = useRouter()

  const handleChatClick = (type: 'chat' | 'contact', chat: ChatsObj | any) => {
    socket.emit('LEAVE_CHAT_ROOM')
    if (type === 'chat') {
      socket.emit('JOIN_CHAT_ROOM', JSON.stringify({ id: chat?.id, userId: user?.id }))
      dispatch(startConversation(chat?.id))
    }
    dispatch(selectChat(chat))
  }

  const fetchChannelChat = async () => {
    const { data } = await chatService.fetchSelectedChannelChat(id as string)
    if (data?.statusCode === '10000') {
      handleChatClick('chat', data?.data?.conversation)
    }
  }

  const otherUsersChat = store?.selectedChat?.participants?.find((participant: any) => participant.userId !== user?.id)

  useEffect(() => {
    if (otherUsersChat) {
      getUserStatuses()
    }
  }, [otherUsersChat])

  async function getUserStatuses() {
    const { data } = await chatService.getUserActiveStatus(otherUsersChat?.userId)
    if (data?.statusCode === '10000') {
      setUserStatus(data?.data?.reciverStatus)
    }
  }

  const deleteSelectedChat = async (selectedChatId: string) => {
    if (pathname === '/channels/[id]/chat') {
      dispatch(deleteChannelChat({ channelId: id as string, id: selectedChatId })).then(({ payload }: any) => {
        if (payload?.statusCode === '10000') {
          handleUserProfileRightSidebarToggle()
          if (user?.role?.code === 'STUDENT') {
            fetchChannelChat()
          }
        }
      })
    } else {
      dispatch(deleteChat(selectedChatId)).then(({ payload }) => {
        if (payload?.statusCode === '10000') {
          handleUserProfileRightSidebarToggle()
        }
      })
    }
  }

  return (
    <Sidebar
      direction='right'
      show={userProfileRightOpen}
      backDropClick={handleUserProfileRightSidebarToggle}
      sx={{
        zIndex: 9,
        height: '100%',
        width: sidebarWidth,
        borderTopRightRadius: theme => theme.shape.borderRadius,
        borderBottomRightRadius: theme => theme.shape.borderRadius,
        '& + .MuiBackdrop-root': {
          zIndex: 8,
          borderRadius: 1
        },
        background: blue
      }}
    >
      {store && store?.selectedChat ? (
        <Fragment>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size='small'
              onClick={handleUserProfileRightSidebarToggle}
              sx={{ top: '0.7rem', right: '0.7rem', position: 'absolute', color: 'text.secondary' }}
            >
              <Close sx={{ color: 'action.active' }} />
            </IconButton>
            <Box sx={{ px: 5, pb: 7, pt: 9.5, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Badge
                  overlap='circular'
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  badgeContent={
                    <Box
                      component='span'
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        // TEMP_OFF_CHAT color: `${statusObj[store.selectedChat.contact.status]}.main`,
                        boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
                        // TEMP_OFF_CHAT backgroundColor: `${statusObj[store.selectedChat.contact.status]}.main`
                      }}
                    />
                  }
                >
                  {store.selectedChat?.participants?.length === 2 ? (
                    otherUsersChat?.user?.profile_picture ? (
                      <MuiAvatar
                        sx={{ width: '5rem', height: '5rem' }}
                        src={otherUsersChat?.user?.profile_picture as string}
                        alt={otherUsersChat?.user?.first_name}
                      />
                    ) : (
                      <CustomAvatar
                        skin='light'
                        // color={store.selectedChat.contact.avatarColor}
                        sx={{ width: '5rem', height: '5rem', fontWeight: 500, fontSize: '2rem' }}
                      >
                        {getInitials(`${otherUsersChat?.user?.first_name} ${otherUsersChat?.user?.last_name}`)}
                      </CustomAvatar>
                    )
                  ) : null}
                  {store.selectedChat?.participants?.length > 2 ? (
                    <CustomAvatar
                      skin='light'
                      // color={store.selectedChat.contact.avatarColor}
                      sx={{ width: '5rem', height: '5rem', fontWeight: 500, fontSize: '2rem' }}
                    >
                      {getInitials(`${store.selectedChat?.name}`)}
                    </CustomAvatar>
                  ) : null}
                </Badge>
              </Box>
              <Typography sx={{ mb: 0.75, fontWeight: 600, textAlign: 'center' }}>
                {store?.selectedChat?.participants?.length > 2
                  ? `${store.selectedChat?.name}`
                  : `${otherUsersChat?.user?.first_name} ${otherUsersChat?.user?.last_name}`}
              </Typography>
              <Typography variant='body2' sx={{ textAlign: 'center' }}>
                {store?.selectedChat?.participants?.length > 2 ? `Group` : otherUsersChat?.user?.role?.code}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 'calc(100% - 13.0625rem)' }}>
            <ScrollWrapper>
              <Box sx={{ p: 5 }}>
                <FormGroup sx={{ mb: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                    Status
                  </Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                    {userStatus === 'OFFLINE' ? (
                      <OfflineIcon />
                    ) : userStatus === 'AWAY' ? (
                      <AwayIcon />
                    ) : userStatus === 'BUSY' ? (
                      <BusyIcon />
                    ) : userStatus === 'DO_NOT_DISTURB' ? (
                      <DoNotDisturbIcon />
                    ) : (
                      <Available />
                    )}
                    <Typography marginLeft={3}>{userStatus || ' Not Available'}</Typography>
                  </Typography>
                </FormGroup>
                <Box sx={{ mb: 6 }}>
                  {store.selectedChat?.participants?.length > 2 ? null : (
                    <Typography variant='body2' sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                      Personal Information
                    </Typography>
                  )}
                  <List dense sx={{ p: 0 }}>
                    {store.selectedChat?.participants?.length > 2 ? null : (
                      <ListItem sx={{ px: 2 }}>
                        <ListItemIcon sx={{ mr: 3 }}>
                          <EmailOutline />
                        </ListItemIcon>
                        <ListItemText
                          sx={{ textTransform: 'lowercase' }}
                          // TEMP_OFF_CHAT secondary={`${store.selectedChat.contact.name.replace(/\s/g, '_')}@email.com`}

                          secondary={`${
                            otherUsersChat?.user?.email ||
                            `${otherUsersChat?.user?.first_name}${otherUsersChat?.user?.last_name}@email.com`
                          }`}
                          // secondary={`${otherUsersChat?.user?.email}`}
                        />
                      </ListItem>
                    )}
                    {/* <ListItem sx={{ px: 2 }}>
                      <ListItemIcon sx={{ mr: 3 }}>
                        <PhoneOutline />
                      </ListItemIcon>
                      <ListItemText secondary='+1(123) 456 - 7890' />
                    </ListItem>
                    <ListItem sx={{ px: 2 }}>
                      <ListItemIcon sx={{ mr: 3 }}>
                        <ClockTimeFiveOutline />
                      </ListItemIcon>
                      <ListItemText secondary='Mon - Fri 10AM - 8PM' />
                    </ListItem> */}
                  </List>
                </Box>

                <Box>
                  <Typography variant='body2' sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                    Settings
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {/* <ListItem disablePadding>
                      <ListItemButton sx={{ px: 2 }}>
                        <ListItemIcon sx={{ mr: 3 }}>
                          <BookmarkOutline />
                        </ListItemIcon>
                        <ListItemText secondary='Add Tag' />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton sx={{ px: 2 }}>
                        <ListItemIcon sx={{ mr: 3 }}>
                          <StarOutline />
                        </ListItemIcon>
                        <ListItemText secondary='Important Contact' />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton sx={{ px: 2 }}>
                        <ListItemIcon sx={{ mr: 3 }}>
                          <ImageOutline />
                        </ListItemIcon>
                        <ListItemText secondary='Shared Media' />
                      </ListItemButton>
                    </ListItem> */}
                    <ListItem disablePadding>
                      <Tooltip title='Click to delete chat'>
                        <ListItemButton sx={{ px: 2 }} disabled={store.status === 'pending'}>
                          <ListItemIcon sx={{ mr: 3 }}>
                            <DeleteOutline />
                          </ListItemIcon>
                          <ListItemText
                            secondary='Delete Chat'
                            disableTypography={true}
                            onClick={() =>
                              store?.conversation?.length > 0
                                ? deleteSelectedChat(store?.selectedChat?.id as string)
                                : toast.error('No messages to delete')
                            }
                          />
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                    {store.selectedChat.status === 'BLOCK' && !store.selectedChat?.isBlocked ? null : (
                      <ListItem disablePadding>
                        <Tooltip
                          title={`Click to ${
                            store.selectedChat.status === 'BLOCK' && store.selectedChat?.isBlocked ? 'unblock' : 'block'
                          }`}
                        >
                          <ListItemButton
                            sx={{ px: 2 }}
                            onClick={() =>
                              handleBlockSelectedChat(
                                store?.selectedChat,
                                handleUserProfileRightSidebarToggle,
                                dispatch,
                                pathname,
                                id as string
                              )
                            }
                          >
                            <ListItemIcon sx={{ mr: 2.5, ml: 0.5 }}>
                              <BlockHelper fontSize='small' />
                            </ListItemIcon>
                            <ListItemText
                              secondary={`${
                                store.selectedChat.status === 'BLOCK' && store.selectedChat?.isBlocked
                                  ? 'Unblock'
                                  : 'Block'
                              } Contact`}
                            />
                          </ListItemButton>
                        </Tooltip>
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Box>
            </ScrollWrapper>
          </Box>
        </Fragment>
      ) : null}
    </Sidebar>
  )
}

export default UserProfileRight

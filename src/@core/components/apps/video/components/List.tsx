import React from 'react'
import Grid from '@mui/material/Grid'
import { Box, Button, CardMedia, Skeleton, Typography } from '@mui/material'
import { useChannels } from 'src/@core/hooks/apps/useChannels'
import FileUploaderRestrictions from '../../liveVideoSdk/FileUploader'
import { useForm } from 'react-hook-form'
import { IChannels } from 'src/types/apps/channels'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import DataNotFound from 'src/@core/components/apps/channels/components/DataNotFound'
import { useTheme } from '@mui/material/styles'

interface Props {
  channelId: string
}

const VideosList: React.FC<Props> = ({ channelId }) => {
  const { store, updateIntroVideoByChannelId } = useChannels(null)
  const theme = useTheme()

  const {
    query: { id }
  } = useRouter()

  const { user } = useAuth()

  const { control, handleSubmit } = useForm()

  const onSubmit = (body: IChannels) => {
    if (!body.intro_video) {
      return toast.error('Please Select A Intro Video')
    } else {
      body.name = store.entity?.name
      body.slug = store.entity?.slug
      body.about = store.entity?.about
      body.thumnail_url = store.entity?.thumnail_url
      body.intro_video = body.intro_video
      body.isAgreed = store.entity.isAgreed
      updateIntroVideoByChannelId(id as string, body)
    }
  }

  return (
    <Grid container item rowSpacing={10} columnSpacing={5} mt={2}>
      {store.status === 'success' && !store.entity?.intro_video ? (
        user?.activeChannel?.channel?.id === store.entity?.id ? (
          <Grid
            item
            // sx={{ background: theme.palette.linear_gradient.cardGradient }}
            container
            justifyContent={'center'}
          >
            <Grid
              sx={{
                background: theme.palette.customColors.darkBg,
                padding: 5,
                borderRadius: 5,
                width: '100%'
              }}
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box textAlign={'center'}>
                  <Typography color={theme.palette.customColors.white} mt={5}>
                    Upload a video to get started
                  </Typography>
                  <Typography color={theme.palette.common.white} mt={2} mb={5}>
                    Start sharing your story and connecting with viewers. Videos that you upload will show up here.
                  </Typography>
                  <FileUploaderRestrictions
                    name='intro_video'
                    accept={{ 'video/*': ['.mp4'] }}
                    maxFiles={1}
                    maxSize={10000000000}
                    minSize={1}
                    control={control}
                  />
                  <Button type='submit' variant='contained' sx={{ marginTop: 5 }} color='primary'>
                    Upload Video
                  </Button>
                </Box>
              </form>
            </Grid>
          </Grid>
        ) : (
          <DataNotFound />
        )
      ) : store.status === 'pending' ? (
        <Skeleton
          variant='rectangular'
          sx={{ minWidth: '100%', height: '50vh', width: '100%', background: theme.palette.customColors.skeletongrey }}
        />
      ) : (
        <>
          <CardMedia
            component='video'
            image={store.entity?.intro_video}
            autoPlay
            width='100%'
            height='250px'
            controls
            style={{ boxShadow: '#ccc 20px 20px 20px' }}
            sx={{
              bgcolor: 'customColors.themeColor',
              boxShadow: 0,
              borderRadius: 1,
              p: 0,
              minWidth: '30%',
              minHeight: 500,
              gap: 2,
              mt: 10,
              objectFit: 'cover'
            }}
          >
            <source src={store?.entity?.intro_video} type='video/mp4' />
          </CardMedia>
          <Typography mt={5} textTransform={'capitalize'}>
            Introduction about {store.entity?.name}
          </Typography>
        </>
      )}
    </Grid>
  )
}

export default VideosList

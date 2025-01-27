import { Box, Grid, Typography, useTheme } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { useDashboard } from 'src/@core/hooks/apps/useDashboard'
import { useEffect } from 'react'
import { GraphBox, SmallGrayText } from 'src/@core/constants/styles'
import dynamic from 'next/dynamic'
const VerticalBarChart = dynamic(() => import('src/@core/components/apps/dashboard/components/VerticalChart'), {
  ssr: false
})

const Page = () => {
  const { store } = useDashboard()
  const theme = useTheme()
  return (
    <GraphBox
      sx={{
        borderRadius: 1
      }}
    >
      <Grid container justifyContent={'space-between'}>
        <Grid item xs={12} sm={7} lg={7}>
          <Box>
            <Typography variant='h5' color={theme.palette.customColors.white}>
              Students Enrollment
            </Typography>
            <SmallGrayText pb={15}>In last 30 days enrollment of students</SmallGrayText>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} paddingBottom={5}>
            <Box gap={5} display={'flex'} alignItems={'center'}>
              <Box>
                <Typography variant='h4' textAlign={'center'}>
                  {store.adminEntity?.thisMonthEnrollmentsCount ? store.adminEntity?.thisMonthEnrollmentsCount : 0}
                </Typography>
                <Box>
                  <SmallGrayText textAlign={'center'}>This Month</SmallGrayText>
                </Box>
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                {store.adminEntity?.monthRaisePercentage <= 0 ? null : <ArrowUpwardIcon color='success' />}
                <Typography
                  variant='h6'
                  sx={store.adminEntity?.monthRaisePercentage <= 0 ? { color: 'red' } : { color: 'greenyellow' }}
                >
                  {store.adminEntity?.monthRaisePercentage
                    ? store.adminEntity?.monthRaisePercentage.toFixed(2) + '%'
                    : '0%'}
                </Typography>
              </Box>
            </Box>
            <Box display={'flex'} gap={2} alignItems={'center'}>
              <Box>
                <Typography variant='h4' textAlign={'center'}>
                  {store.adminEntity?.thisWeekEnrollmentsCount ? store.adminEntity?.thisWeekEnrollmentsCount : 0}
                </Typography>
                <Box>
                  <SmallGrayText textAlign={'center'}>This Week</SmallGrayText>
                </Box>
              </Box>
              <Box display={'flex'}>
                {store.adminEntity?.weekRaisePercentage <= 0 ? null : <ArrowUpwardIcon color='success' />}
                <Typography
                  variant='h6'
                  sx={store.adminEntity?.weekRaisePercentage <= 0 ? { color: 'red' } : { color: 'greenyellow' }}
                >
                  {store.adminEntity?.weekRaisePercentage
                    ? store.adminEntity?.weekRaisePercentage.toFixed(2) + '%'
                    : '0%'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={5} lg={5}>
          <VerticalBarChart
            yellow={'#fff'}
            labelColor={'transparent'}
            borderColor={'transparent'}
            gridLineColor={'transparent'}
          />
        </Grid>
      </Grid>
    </GraphBox>
  )
}

export default Page

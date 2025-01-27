import { getInitials } from 'src/@core/utils/get-initials'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** renders client column
export const renderClient = (profilePicture: string, fullName: string) => {
  if (profilePicture) {
    return <CustomAvatar src={profilePicture} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar skin='light' color={'primary'} sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}>
        {getInitials(fullName || 'UnKnown')}
      </CustomAvatar>
    )
  }
}

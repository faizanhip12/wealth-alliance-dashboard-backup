// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types
import { EventDateType, AddEventSidebarType } from 'src/types/apps/calendarTypes'
import { updateEvent } from 'src/store/apps/calendar'
import LoadingButton from '@mui/lab/LoadingButton'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { Tooltip } from '@mui/material'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  // url: string
  title: string
  allDay: boolean
  // calendar: string
  description: string
  endDate: Date | string
  startDate: Date | string
  // guests: string[] | string | undefined
}

const capitalize = (string: string) => string && string[0].toUpperCase() + string.slice(1)

const defaultState: DefaultStateType = {
  // url: '',
  title: '',
  // guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  // calendar: 'Business',
  startDate: new Date()
}

const AddEventSidebar = (props: AddEventSidebarType) => {
  // ** Props
  const {
    addCourseEvent,
    deleteCourseEvent,
    updateCourseEvent,
    fullEvent,
    setFullEvent,
    eventEdit,
    setEventEdit,
    store,
    dispatch,
    addEvent,
    drawerWidth,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle
  } = props

  // ** States
  const [values, setValues] = useState<DefaultStateType>(defaultState)

  const { pathname, query } = useRouter()

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '', description: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
    setEventEdit(false)
  }

  const onSubmit = async (data: { title: string; description: string }) => {
    const modifiedEvent: any = {
      title: data.title,
      description: data.description,
      end: values.endDate,
      allDay: values.allDay,
      start: values.startDate,
      eventType: pathname === '/calendar' ? 'GENERAL' : pathname === '/course/[id]/event' ? 'COURSE' : 'SCHEDULED'
    }
    if (!eventEdit) {
      const { payload }: any = await dispatch(
        pathname === '/calendar'
          ? addEvent(modifiedEvent)
          : pathname === '/course/[id]/event'
            ? addCourseEvent({
              title: data?.title,
              description: data?.description,
              playlistId: query?.id,
              end: values.endDate,
              allDay: values.allDay,
              start: values.startDate,
              eventType: modifiedEvent?.eventType
            })
            : null
      )
      if (payload?.statusCode === '10000') {
        handleSidebarClose()
        setEventEdit(false)
      }
    } else {
      modifiedEvent.id = fullEvent?.id
      const { payload }: any = await dispatch(
        pathname === '/calendar'
          ? updateEvent(modifiedEvent)
          : pathname === '/course/[id]/event'
            ? updateCourseEvent({ modifiedEvent, courseId: query?.id })
            : null
      )
      if (payload?.statusCode === '10000') {
        handleSidebarClose()
        setEventEdit(false)
      }
    }
  }

  const handleDeleteEvent = async () => {
    if (eventEdit) {
      if (pathname === '/calendar') {
        const { payload }: any = await dispatch(deleteEvent(fullEvent?.id))
        if (payload?.statusCode === '10000') {
          handleSidebarClose()
          setEventEdit(false)
        }
      } else if (pathname === '/course/[id]/event') {
        const { payload }: any = await dispatch(deleteCourseEvent({ eventId: fullEvent?.id, playlistId: query?.id }))
        if (payload?.statusCode === '10000') {
          handleSidebarClose()
          setEventEdit(false)
        }
      }
      // const { payload }: any = await dispatch(
      //   pathname === '/course/[id]/event'
      //     ? deleteCourseEvent({ eventId: fullEvent?.id, playlistId: query?.id })
      //     : pathname === '/calender'
      //     ? deleteEvent(fullEvent?.id)
      //     : {}
      // )
      // if (payload?.statusCode === '10000') {
      //   handleSidebarClose()
      //   setEventEdit(false)
      // }
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    // handleSidebarClose()
  }

  const handleStartDate = (date: Date) => {
    if (date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (eventEdit) {
      // setValue("startDate",)
      setValue('title', fullEvent?._def?.title)
      setValue('description', fullEvent?._def?.extendedProps?.description)
      setValues({
        title: fullEvent?._def?.title || '',
        allDay: fullEvent?._def?.allDay,
        // guests: event.extendedProps.guests || [],
        description: fullEvent?._def?.extendedProps?.description || '',
        // calendar: event.extendedProps.calendar || 'Business',
        endDate: fullEvent?.end !== null ? fullEvent?.end : fullEvent?.start,
        // startDate: fullEvent?._instance?.range?.start !== null ? fullEvent?._instance?.range?.start : new Date()
        startDate: fullEvent?._instance?.range?.start !== null ? fullEvent?._instance?.range?.start : new Date()
      })
    }
  }, [setValue, eventEdit])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValue('description', '')
    setValues(defaultState)
  }, [setValue])

  useEffect(() => {
    if (eventEdit) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, eventEdit])

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        sx={{ width: '100%' }}
        error={props.error}
      />
    )
  })

  const RenderSidebarFooter = () => {
    if (!eventEdit) {
      return (
        <Fragment>
          <LoadingButton
            size='large'
            type='submit'
            variant='contained'
            color='primary'
            loadingPosition='end'
            sx={{ mr: 4 }}
            disabled={store.status === 'pending'}
            loading={store.status === 'pending'}
          >
            Add
          </LoadingButton>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <LoadingButton
            size='large'
            type='submit'
            variant='contained'
            color='primary'
            loadingPosition='end'
            sx={{ mr: 4 }}
            disabled={store.status === 'pending'}
            loading={store.status === 'pending'}
          >
            Update
          </LoadingButton>
          {/* <Button size='large' variant='outlined' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button> */}
        </Fragment>
      )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'background.default',
          p: (theme: any) => theme.spacing(3, 3.255, 3, 5.255)
        }}
      >
        <Typography variant='h6'>{eventEdit ? 'Update Event' : 'Add Event'}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {eventEdit ? (
            <Tooltip title='Delete Event'>
              <DeleteOutline
                fontSize='medium'
                sx={{ cursor: 'pointer', mr: eventEdit ? 5 : 0 }}
                onClick={handleDeleteEvent}
              />
            </Tooltip>
          ) : null}
          <Tooltip title='Close'>
            <Close fontSize='medium' onClick={handleSidebarClose} sx={{ cursor: 'pointer' }} />
          </Tooltip>
        </Box>
      </Box>
      <Box className='sidebar-body' sx={{ p: (theme: any) => theme.spacing(5, 6) }}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <FormControl fullWidth>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) =>
                  eventEdit ? (
                    <TextField
                      label='Title'
                      defaultValue={fullEvent}
                      value={value}
                      onChange={onChange}
                      error={Boolean(errors.title)}
                    />
                  ) : (
                    <TextField label='Title' value={value} onChange={onChange} error={Boolean(errors.title)} />
                  )
                }
              />
              {errors.title && (
                <FormHelperText sx={{ color: 'error.main' }} id='event-title-error'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <Controller
                name='description'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) =>
                  eventEdit ? (
                    <TextField
                      label='description'
                      defaultValue={fullEvent}
                      value={value}
                      sx={{ marginTop: 5, mb: 5 }}
                      onChange={onChange}
                      rows={4}
                      multiline
                      error={Boolean(errors.description)}
                    />
                  ) : (
                    <TextField
                      label='description'
                      sx={{ marginTop: 5, mb: 5 }}
                      value={value}
                      multiline
                      rows={4}
                      onChange={onChange}
                      error={Boolean(errors.description)}
                    />
                  )
                }
              />
              {errors.description && (
                <FormHelperText sx={{ color: 'error.main' }} id='event-title-error'>
                  This field is required
                </FormHelperText>
              )}
              {/* <TextField
                sx={{ marginTop: 5, mb: 5 }}
                name='description'
                label='Description'
                placeholder='Tell viewers about your event'
                type='text-area'
                multiline
                rows={4}
              /> */}
              {/* 
              <InputLabel id='event-calendar'>Calendar</InputLabel>
              <Select
                label='Calendar'
                value={values.calendar}
                labelId='event-calendar'
                onChange={e => setValues({ ...values, calendar: e.target.value })}
              >
                <MenuItem value='Personal'>Personal</MenuItem>
                <MenuItem value='Business'>Business</MenuItem>
                <MenuItem value='Family'>Family</MenuItem>
                <MenuItem value='Holiday'>Holiday</MenuItem>
                <MenuItem value='ETC'>ETC</MenuItem>
              </Select>
            */}
            </FormControl>
            <Box sx={{ mb: 6 }}>
              <TextField
                required
                sx={{ width: '100%' }}
                id='event-start-date'
                label='Start Date'
                type='datetime-local'
                color='secondary'
                value={values.startDate}
                // onSelect={handleStartDate}
                onChange={e => setValues({ ...values, startDate: e.target.value })}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16),
                  // max: maxDateTime.toISOString().slice(0, 16)
                }}
                InputLabelProps={{ shrink: true }}
              />
              {/* <DatePicker
                selectsStart
                id='event-start-date'
                endDate={values.endDate as EventDateType}
                selected={values.startDate as EventDateType}
                startDate={values.startDate as EventDateType}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Start Date' registername='startDate' />}
                onChange={(date: Date) => setValues({ ...values, startDate: new Date(date) })}
                onSelect={handleStartDate}
              /> */}
            </Box>
            <Box sx={{ mb: 6 }}>
              {/* <TextField
                sx={{ width: '100%' }}
                id='event-end-date'
                label='End Date'
                type='datetime-local'
                color='secondary'
                value={values.endDate}
                // onSelect={handleStartDate}
                onChange={e => setValues({ ...values, endDate: e.target.value })}
                // inputProps={{
                //   min: minDateTime.toISOString().slice(0, 16),
                //   max: maxDateTime.toISOString().slice(0, 16)
                // }}
                InputLabelProps={{ shrink: true }}
              /> */}
              <DatePicker
                selectsEnd
                id='event-end-date'
                endDate={values.endDate as EventDateType}
                selected={values.endDate as EventDateType}
                minDate={values.startDate as EventDateType}
                startDate={values.startDate as EventDateType}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='End Date' registername='endDate' />}
                onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
              />
            </Box>
            <FormControl sx={{ mb: 6 }}>
              <FormControlLabel
                label='All Day'
                control={
                  <Switch checked={values.allDay} onChange={e => setValues({ ...values, allDay: e.target.checked })} />
                }
              />
            </FormControl>
            {/* <TextField
              fullWidth
              type='url'
              id='event-url'
              sx={{ mb: 6 }}
              label='Event URL'
              value={values.url}
              onChange={e => setValues({ ...values, url: e.target.value })}
            />
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-guests'>Guests</InputLabel>
              <Select
                multiple
                label='Guests'
                value={values.guests}
                labelId='event-guests'
                id='event-guests-select'
                onChange={e => setValues({ ...values, guests: e.target.value })}
              >
                <MenuItem value='bruce'>Bruce</MenuItem>
                <MenuItem value='clark'>Clark</MenuItem>
                <MenuItem value='diana'>Diana</MenuItem>
                <MenuItem value='john'>John</MenuItem>
                <MenuItem value='barry'>Barry</MenuItem>
              </Select>
            </FormControl>
            <TextField
              rows={4}
              multiline
              fullWidth
              sx={{ mb: 6 }}
              label='Description'
              id='event-description'
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
            /> */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RenderSidebarFooter />
            </Box>
          </form>
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar

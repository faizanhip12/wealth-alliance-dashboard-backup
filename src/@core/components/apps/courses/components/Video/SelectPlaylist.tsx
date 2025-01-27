import React, { useState, useMemo, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

// ** MUI
import Radio from '@mui/material/Radio'
import Autocomplete from '@mui/material/Autocomplete'
import TextField, { BaseTextFieldProps } from '@mui/material/TextField'

// ** Actions
import { fetchAllAction } from 'src/store/apps/playlist'

import { Controller } from 'react-hook-form'

// ** types
import { RootState, AppDispatch } from 'src/store'
import { PlaylistApi } from 'src/types/apps/playlist'
import { useAuth } from 'src/hooks/useAuth'
import { useTheme } from '@mui/material/styles'

interface PlayListSingleSelect extends BaseTextFieldProps {
  execute?: boolean
  playlist: PlaylistApi | {} | any
  setPlaylist: (project: PlaylistApi) => void
  isOpen?: boolean | any
  setIsOpen?: boolean | any
  isFormSubmitted?: any
  setIsFormSubmitted?: any
}

export default function PlayListSingleSelect({
  execute = false,
  playlist,
  setPlaylist,
  setIsOpen,
  isOpen,
  isFormSubmitted,
  setIsFormSubmitted,
  ...props
}: PlayListSingleSelect) {
  const [selected, setSelected] = useState<PlaylistApi | {}>(playlist)

  const store = useSelector((state: RootState) => state.playlist)
  const dispatch = useDispatch<AppDispatch>()

  const { user } = useAuth()

  useEffect(() => {
    execute && dispatch(fetchAllAction(user?.activeChannel?.channel?.id))
  }, [])

  useEffect(() => {
    if (isFormSubmitted) {
      setSelected({})
      setIsFormSubmitted(false)
    }
  }, [isFormSubmitted])

  useMemo(() => {
    if (typeof selected === 'string') {
      const select = store.entities.find(el => el.id === selected)
      if (select) {
        setSelected(select)
      }
    } else {
      selected && 'id' in selected && setPlaylist(selected)
    }
  }, [selected])

  const theme = useTheme()

  return (
    <Autocomplete
      fullWidth
      id='category-single-select'
      options={store.entities}
      autoHighlight
      getOptionLabel={(option: PlaylistApi) => {
        if (option && 'name' in option) return option.name
        else return ''
      }}
      value={selected as any}
      disableCloseOnSelect
      onChange={(r, e: any) => setSelected(e)}
      renderOption={(props, option: PlaylistApi, { selected }) => (
        <li {...props} style={{ background: theme.palette.customColors.dark }}>
          <Radio checked={selected} />
          {option.name}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          {...props}
          label='Select playlist'
          placeholder='playlist'
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
      )}
    />
  )
}

interface PlayListSingleSelectWithFormProps {
  control: any
  name: string
}

export const PlayListSingleSelectWithForm: React.FC<PlayListSingleSelectWithFormProps> = ({ control, name }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <PlayListSingleSelect
          execute={false}
          error={Boolean(error)}
          playlist={value}
          setPlaylist={playlist => onChange(playlist.id)}
        />
      )}
    />
  )
}

import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { useIsEditing } from '@/utils/useIsEditing'
import React, { useState } from 'react'
import { useAlert } from '../alerts'
import { v4 } from 'uuid';
import styles from './imageUpload.module.scss'
import { Button } from '../button';

type ImageUploadProps = {
  value: string
  text: string
  onChange: (file: any) => void
  onRemove: () => void
}

export const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  const isEditing = useIsEditing()
  const { value, text, onChange, onRemove } = props
  const [removeOpen, setRemoveOpen] = useState(false)

  const fetchWithAuth = useFetchWithAuth()

  const addAlert = useAlert()

  if (!isEditing) {
    return null
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      const imagePath = v4()

      const formData = new FormData();
 
      formData.append(
          "file",
          file,
          file.name,
      )

      formData.append('image-path', imagePath)

      const response = await fetchWithAuth({
        method: 'POST',
        body: formData,
        path: '/image'
      })

      if (!response.ok) {
        let error = 'There was a problem uploading the file'

        try {
          error = (await response.json())?.error
        }
        finally {
          addAlert(error)
          return
        }
      }

      onChange(imagePath)
      setRemoveOpen(false)
    }
  }

  if (!value) {
    return (
      <div className={styles.imageUpload}>
        <label>
          Click to add {text} +
          <input data-testid='image-upload' type="file" onChange={onFileChange}/>
        </label>
      </div>
    )
  }

  return (<>
    <div
      className={styles.openRemove}
      onClick={() => setRemoveOpen(true)}
      data-testid='open-remove-image'
    />
    <div className={styles.imageRemoveModal} style={{
      display: removeOpen ? 'block' : 'none'
    }}>
      <Button text='Remove' onClick={onRemove} />
      <Button text='Cancel' onClick={() => setRemoveOpen(false)} />
    </div>
  </>
  )
}
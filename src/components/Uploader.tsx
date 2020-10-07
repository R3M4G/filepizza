import React, { useRef, useEffect } from 'react'
import { usePeerData } from 'react-peer-data'
import { UploadedFile } from '../types'
import { Room } from 'peer-data'

interface Props {
  roomName: string
  files: UploadedFile[]
}

const Uploader: React.FC<Props> = ({ roomName, files }: Props) => {
  const room = useRef<Room | null>(null)
  const peerData = usePeerData()

  useEffect(() => {
    room.current = peerData.connect(roomName)
    room.current
      .on('participant', (participant) => {
        console.log(participant.getId() + ' joined')

        participant
          .on('connected', () => {
            console.log('connected', participant.id)
          })
          .on('disconnected', () => {
            console.log('disconnected', participant.id)
          })
          .on('track', (event) => {
            console.log('stream', participant.id, event.streams[0])
          })
          .on('message', (payload) => {
            console.log(participant.id, payload)
          })
          .on('error', (event) => {
            console.error('peer', participant.id, event)
            participant.renegotiate()
          })
        participant.send(`hello there, I'm the uploader`)
      })
      .on('error', (event) => {
        console.error('room', roomName, event)
      })

    return () => {
      room.current.disconnect()
      room.current = null
    }
  }, [peerData])

  const items = files.map((f) => <li key={f.fullPath}>{f.fullPath}</li>)
  return <ul>{items}</ul>
}

export default Uploader

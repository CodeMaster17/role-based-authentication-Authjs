import { auth } from '@/auth'
import React from 'react'

const Settings = async () => {
    const user = await auth()
    return (
        <div>
            {JSON.stringify(user)}
        </div>
    )
}

export default Settings

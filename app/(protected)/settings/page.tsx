import { auth, signOut } from '@/auth'
import React from 'react'

const Settings = async () => {
    const session = await auth()
    console.log(JSON.stringify(session?.user.role)) // session can be possibly null, so do optional chaining
    return (
        <div>
            {JSON.stringify(session)}

            <button type='submit'>
                Singout
            </button>

        </div>
    )
}

export default Settings

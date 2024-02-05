import { UserInfo } from '@/components/user-info'
import { currentUser } from '@/lib/auth';

import React from 'react'

const ServerPage = async () => {
    const user = await currentUser();
    console.log(user);
    return (
        <div>
            <UserInfo label="Server" user={user} />
        </div>
    )
}

export default ServerPage

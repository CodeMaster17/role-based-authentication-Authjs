'use client'
import { UserInfo } from '@/components/user-info';
import { useCurrentUser } from '@/hooks/use-current-user';
import React from 'react'

const ClientPage = () => {
    const user = useCurrentUser();
    console.log(user);
    return (
        <div>
            <UserInfo label="Client Component" user={user} />
        </div>
    )
}

export default ClientPage

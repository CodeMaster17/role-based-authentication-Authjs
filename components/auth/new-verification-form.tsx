'use client'
import React, { useCallback, useEffect } from 'react'
import { CardWrapper } from './card-wrapper'
import { BeatLoader } from 'react-spinners'
import { useSearchParams } from 'next/navigation'

const NewVerficationForm = () => {

    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const onSubmit = useCallback(() => {
        console.log(token)
    }, [token])


    useEffect(() => {
        onSubmit()
    }, [token])

    return (
        <CardWrapper
            headerLabel="Confirming your verification"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <div className="flex items-center w-full justify-center">
                <BeatLoader />
            </div>
        </CardWrapper>
    )
}

export default NewVerficationForm

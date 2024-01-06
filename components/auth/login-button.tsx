import router, { useRouter } from 'next/navigation'
import React from 'react'

interface LoginButtonProps {
    children: React.ReactNode
    mode?: 'modal' | 'redirect'
    asChild?: boolean
}

const LoginButton = ({ children, mode = "redirect", asChild }: LoginButtonProps) => {

    const router = useRouter()

    if (mode === 'modal') {
        return (
            <>
                <p>
                    Modal
                </p>
            </>
        )
    }


    const onClick = () => [
        router.push('/auth/login')
    ]

    return (
        <span onClick={onClick} className='cursor-pointer'>
            {children}
        </span>
    )
}

export default LoginButton

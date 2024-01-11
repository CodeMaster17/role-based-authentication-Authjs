'use client'
import React, { startTransition, useState } from 'react'
import { CardWrapper } from './card-wrapper'
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { LoginSchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import Link from 'next/link';
import { FormSuccess } from '../form-sucess';
import { FormError } from '../form-error';
import { Login } from '@/actions/auth/login';
import { useSearchParams } from 'next/navigation';


const LoginForm = () => {

    // * for getting search params for error in case not logged in
    const searchParams = useSearchParams()
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already with different mail provider" : ""

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");
        startTransition(() => {
            Login(values)
                .then((data) => {
                    if (data?.error) {
                        form.reset();
                        setError(data?.error);
                    }

                    if (data?.success) {
                        form.reset();
                        setSuccess(data.success);
                    }
                })
                .catch(() => setError("Something went wrong"));
        });
    }

    return (
        <CardWrapper headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="john.doe@example.com"
                                        type="email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}

                                        placeholder="******"
                                        type="password"
                                    />
                                </FormControl>
                                <Button
                                    size="sm"
                                    variant="link"
                                    asChild
                                    className="px-0 font-normal"
                                >
                                    <Link href="/auth/reset">
                                        Forgot password?
                                    </Link>
                                </Button>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormSuccess message={success} />
                    <FormError message={error || urlError} />


                    <Button

                        type="submit"
                        className="w-full mt-2"
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default LoginForm

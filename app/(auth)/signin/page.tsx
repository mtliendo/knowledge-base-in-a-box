'use client'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

function SignInPage() {
	useEffect(() => {
		redirect('/admin/manage-knowledgebase')
	}, [])
	return null
}

export default withAuthenticator(SignInPage, { signUpAttributes: ['email'] })

import { Context } from '@aws-appsync/utils'

export function request(ctx: Context) {
	console.log('the appsync ctx', ctx)
	return {}
}

export function response(ctx: Context) {
	return ctx.prev.result
}

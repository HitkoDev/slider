import { createToken } from '@task/utils'
import Koa from 'koa'
import Router from 'koa-router'
import { DependencyContainer } from 'tsyringe'

export interface AppCustomContext {
    /**
     * Scoped container of the request
     */
    container: DependencyContainer
    /**
     * Time of the request.
     */
    time: Date
}

export type AppContext = Koa.ParameterizedContext<any, AppCustomContext & Router.IRouterContext>

export const APP_CONTEXT = createToken<AppContext>({
    name: 'APP_CONTEXT'
})

import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateHttpLibrary(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  packageJson.dependencies = packageJson.dependencies || {}

  switch (config.httpLibrary) {
    case 'axios': {
      packageJson.dependencies.axios = '^1.10.0'
      context.files[`src/service/index${context.fileExtension}`] = generateAxiosService(config.language ?? 'typescript')
      if (config.language === 'typescript') {
        context.files[`src/service/types${context.fileExtension}`] = generateAxiosTypes()
      }
      break
    }
    case 'ky': {
      packageJson.dependencies.ky = '^1.8.1'
      context.files[`src/service/index${context.fileExtension}`] = generateKyService(config.language ?? 'typescript')
      if (config.language === 'typescript') {
        context.files[`src/service/types${context.fileExtension}`] = generateKyTypes()
      }
      break
    }
  }
}

// src/service/index.{js,ts}
function generateAxiosService(language: 'javascript' | 'typescript') {
  if (language === 'typescript') {
    return `import type { AxiosError, AxiosInstance } from 'axios'
import type { CustomRequestConfig, IApiResponse } from './types'
import axios from 'axios'

function request<TRequest = any, TResponse = any>(
  config: CustomRequestConfig<TRequest>,
): Promise<TResponse> {
  const instance: AxiosInstance = axios.create({
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      const res = response.data as IApiResponse<TResponse>
      if (res.code !== 0 && res.code !== 200) {
        if (res.code === 401) {
          console.error('Login expired, please log in again!')
        }
        if (config.showError !== false) {
          console.error(res.message || 'Error')
        }
        return Promise.reject(new Error(res.message || 'Error'))
      }
      response.data = res.data
      return response
    },
    (error: AxiosError) => {
      let message = ''
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = 'Bad Request (400)'
            break
          case 401:
            message = 'Unauthorized, please log in again (401)'
            break
          case 403:
            message = 'Forbidden (403)'
            break
          case 404:
            message = 'Not Found (404)'
            break
          case 500:
            message = 'Internal Server Error (500)'
            break
          default:
            message = \`Connection error (\${error.response.status})!\`
        }
      }
      else if (error.request) {
        message = 'Network connection timeout!'
      }
      else {
        message = 'Request failed, please check your network!'
      }

      if (config.showError !== false) {
        console.error(message)
      }

      return Promise.reject(error)
    },
  )

  return instance.request<any, TResponse>(config)
}

export default request
`
  }
  else {
    return `import axios from 'axios'

/**
 * @typedef {import('axios').AxiosRequestConfig & {showError?: boolean, showLoading?: boolean}} CustomRequestConfig
 */

/**
 * General request function based on Axios
 * @param {CustomRequestConfig} config Custom request configuration
 * @returns {Promise<any>} A Promise that resolves with the backend's data field on success, or throws an error on failure
 */
function request(config) {
  const instance = axios.create({
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      const res = response.data

      if (res.code !== 0 && res.code !== 200) {
        if (res.code === 401) {
          console.error('Login expired, please log in again!')
        }

        if (config.showError !== false) {
          console.error(res.message || 'Error')
        }

        return Promise.reject(new Error(res.message || 'Error'))
      }

      return res.data
    },
    (error) => {
      let message = ''
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = 'Bad Request (400)'
            break
          case 401:
            message = 'Unauthorized, please log in again (401)'
            break
          case 403:
            message = 'Forbidden (403)'
            break
          case 404:
            message = 'Not Found (404)'
            break
          case 500:
            message = 'Internal Server Error (500)'
            break
          default:
            message = \`Connection error (\${error.response.status})!\`
        }
      }
      else if (error.request) {
        message = 'Network connection timeout!'
      }
      else {
        message = 'Request failed, please check your network!'
      }

      if (config.showError !== false) {
        console.error(message)
      }

      return Promise.reject(error)
    },
  )

  return instance.request(config)
}

export default request
`
  }
}

// src/service/types.ts
function generateAxiosTypes() {
  return `import type { AxiosRequestConfig } from 'axios'

export interface CustomRequestConfig<TRequest = any> extends AxiosRequestConfig {
  showLoading?: boolean
  showError?: boolean
  data?: TRequest
}

export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}
`
}

// src/service/index.{js,ts}
function generateKyService(language: 'javascript' | 'typescript') {
  if (language === 'typescript') {
    return `import type { Hooks, KyInstance, Options } from 'ky'
import type { IApiResponse } from './types'
import ky from 'ky'
import { BusinessError } from './types'

const hooks: Hooks = {
  beforeRequest: [
    (request) => {
      const token = localStorage.getItem('token')
      if (token) {
        request.headers.set('Authorization', \`Bearer \${token}\`)
      }
    },
  ],

  afterResponse: [
    async (_, __, response) => {
      if (response.status === 204) {
        return response
      }

      const parsed = (await response.json()) as IApiResponse

      if (parsed.code !== 0 && parsed.code !== 200) {
        if (parsed.code === 401) {
          console.error('Login expired, please log in again!')
        }

        console.error(parsed.message || 'Business Error')

        throw new BusinessError(parsed.message, parsed.code)
      }

      const body = JSON.stringify(parsed.data)
      return new Response(body, {
        ...response,
        headers: new Headers(response.headers),
      })
    },
  ],

  beforeError: [
    (error) => {
      const { response } = error
      let message = ''
      if (response) {
        message = \`[\${response.status}] \${response.statusText}\`
      }
      else {
        message = 'Network connection failed, please try again later'
      }

      console.error(message)

      return error
    },
  ],
}

const options: Options = {
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  hooks,
}

const service: KyInstance = ky.create(options)

export default service
`
  }
  else {
    return `import ky from 'ky'

/**
 * Custom business error, used to distinguish between HTTP errors and backend business logic errors in catch blocks.
 * @param {string} message - Error message
 * @param {number} code - Business error code
 */
export class BusinessError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}

const hooks = {
  /**
   * Hook before request is sent
   */
  beforeRequest: [
    (request) => {
      const token = localStorage.getItem('token')
      if (token) {
        request.headers.set('Authorization', \`Bearer \${token}\`)
      }
    },
  ],

  /**
   * Hook after response is received
   */
  afterResponse: [
    async (request, options, response) => {
      if (response.status === 204) {
        return response
      }

      const parsed = await response.json()

      if (parsed.code !== 0 && parsed.code !== 200) {
        if (parsed.code === 401) {
          console.error('Login expired, please log in again!')
        }

        console.error(parsed.message || 'Business Error')

        throw new BusinessError(parsed.message || 'Unknown Business Error', parsed.code)
      }

      const body = JSON.stringify(parsed.data)
      return new Response(body, {
        ...response,
        headers: new Headers(response.headers),
      })
    },
  ],

  /**
   * Hook when an error occurs (e.g. network error, HTTP 4xx/5xx)
   */
  beforeError: [
    (error) => {
      const { response } = error
      let message = ''
      if (response) {
        message = \`[\${response.status}] \${response.statusText || 'Request Error'}\`
      }
      else {
        message = 'Network connection failed, please try again later'
      }

      console.error(message)

      return error
    },
  ],
}

const service = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  hooks,
})

export default service
`
  }
}

// src/service/types.ts
function generateKyTypes() {
  return `export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export class BusinessError extends Error {
  public code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}
`
}

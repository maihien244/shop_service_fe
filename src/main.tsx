import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './module/auth/context/auth-context'

import 'filepond/dist/filepond.min.css';
import { registerPlugin } from 'filepond'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'  
import { routeTree } from './routeTree.gen';

import { Toaster } from '#/components/ui/toast'
import { ThemeProvider } from './provider/theme-provider';

import 'swiper/css';

registerPlugin(FilePondPluginImageResize, FilePondPluginImageTransform);

const queryClient = new QueryClient()

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <RouterProvider router={router} />
                    <Toaster />
                </ThemeProvider>
            </QueryClientProvider>
        </AuthProvider>
    )
}


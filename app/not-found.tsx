import Link from 'next/link'
import { Button } from '@/components/ui/button'
const NotFound = () => {
	return <div className="min-h-screen flex flex-col items-center justify-center">
		<h1 className='text-7xl font-bold gradient-title'>404</h1>
		<h2 className='text-3xl font-semibold mb-4'>Page Not Found!</h2>
		<p className='text-sm text-gray-400'>Sorry, It seems like the page you're looking for doesn't exist.</p>
		<Link href="/"><Button className="rounded-full text-gray-900 bg-slate-50 hover:bg-slate-200">Back to Home</Button></Link>
	</div>
}
export default NotFound
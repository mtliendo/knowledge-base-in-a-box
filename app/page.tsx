import Link from 'next/link'
import { FaSquareXTwitter, FaLinkedin, FaSquareYoutube } from 'react-icons/fa6'

export default function Home() {
	return (
		<main>
			<section className="hero min-h-screen bg-base-200">
				<div className="hero-content flex-col  text-center">
					<img
						src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg"
						className="max-w-sm rounded-lg shadow-2xl"
					/>
					<div>
						<h1 className="text-5xl font-bold">Hobby Knowledge Base</h1>
						<p className="py-6 max-w-xl">
							A simple knowledge base powered by Pinecone, NextJS, Amazon
							Bedrock and AWS AppSync 🚀
						</p>
						<Link href="/chat" className="btn btn-primary">
							Start Chatting
						</Link>
					</div>
				</div>
			</section>
			<section>
				<div className="card w-96 glass">
					<figure>
						<img
							src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
							alt="car!"
						/>
					</figure>
					<div className="card-body">
						<h2 className="card-title">Life hack</h2>
						<p>How to park your car at your garage?</p>
					</div>
				</div>
			</section>
			<footer className="footer items-center p-4 bg-neutral text-neutral-content">
				<aside className="items-center grid-flow-col">
					<p>
						Made with ❤️ by{' '}
						<a
							className=" font-bold link link-hover hover:text-gray-100 transition-colors duration-300 bold"
							href="https://focusotter.com"
							target="_blank"
						>
							Focus Otter
						</a>
					</p>
				</aside>
				<nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
					<a
						href="https://twitter.com/intent/follow?screen_name=focusotter"
						target="_blank"
					>
						<FaSquareXTwitter
							size={'2em'}
							className="text-green-400 hover:text-green-600 transition-colors duration-300"
						/>
					</a>
					<a href="https://www.linkedin.com/in/focusotter" target="_blank">
						<FaLinkedin
							size={'2em'}
							className="text-blue-400 hover:text-blue-600 transition-colors duration-300"
						/>
					</a>
					<a href="https://www.youtube.com/focusotter?sub_confirmation=1">
						<FaSquareYoutube
							size={'2em'}
							className="text-red-400 hover:text-red-600 transition-colors duration-300"
						/>
					</a>
				</nav>
			</footer>
		</main>
	)
}

'use client'
import React from 'react'

function ChatPage() {
	return (
		<div className="flex flex-col h-screen">
			<div className="bg-accent rounded text-black p-4 text-4xl fixed top-0 w-full z-10 text-center">
				Windsor Crest Neighborhood Services
			</div>

			<div className="flex flex-col overflow-auto pt-20 pb-24">
				<div className="chat chat-end">
					<div className="chat-bubble chat-bubble-info">
						Who can help me build my fence?
					</div>
				</div>
				<div className="chat chat-start">
					<div className="chat-bubble chat-bubble-primary max-w-lg">
						You can get a hold of Brian Bourke! His phone number is
						563-555-5555! He just started adding fences as part of his business
						portfolio!
					</div>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 w-full p-2 flex items-center z-10">
				<input
					type="text"
					className="input input-bordered input-accent w-full"
					placeholder="Type your message here..."
				/>

				<button className="btn btn-accent ml-2">Send</button>
			</div>
		</div>
	)
}

export default ChatPage

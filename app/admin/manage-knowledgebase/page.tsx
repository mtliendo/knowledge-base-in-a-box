'use client'

import React, { useState, FormEvent } from 'react'

function ManageKnowledgeBasePage() {
	const [file, setFile] = useState<File | undefined>()
	const [kbName, setkbName] = useState('')

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		console.log('thefile', file)
		console.log('kbName', kbName)
	}
	return (
		<main>
			<h1 className="text-3xl text-center">Manage Knowledge Base</h1>
			<form onSubmit={handleSubmit}>
				<div className=" my-4">
					<label className="form-control w-full max-w-s">
						<div className="label">
							<span className="label-text">Knowledge Base Name</span>
						</div>
					</label>
					<input
						type="text"
						className="input  input-bordered input-accent w-full"
						placeholder="Type here"
						value={kbName}
						onChange={(e) => setkbName(e.target.value)}
					/>
				</div>
				<input
					type="file"
					className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
					onChange={(e) => setFile(e.target.files![0])}
				/>
				<div className="mt-4">
					<button className="btn btn-accent" type="submit">
						Submit
					</button>
				</div>
			</form>
		</main>
	)
}

export default ManageKnowledgeBasePage

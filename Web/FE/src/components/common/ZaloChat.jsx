
const ZaloChat = () => {
	return (
		<div className="fixed bottom-6 right-6 z-50">
			<a
				href="https://zalo.me/0375225749"
				target="_blank"
				rel="noopener noreferrer"
				className="group flex items-center justify-center w-14 h-14 bg-luxury-taupe hover:bg-luxury-brown rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
				aria-label="Chat qua Zalo"
			>
				<svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor shadow-sm">
					<path d="M21.011 12.002c0-4.665-3.83-8.448-8.555-8.448-4.724 0-8.555 3.783-8.555 8.448 0 4.14 2.972 7.601 6.946 8.324l-1.076 2.053c-.114.218.043.473.284.473h.001a.332.332 0 00.283-.173l1.838-3.5h.279c4.724.001 8.555-3.782 8.555-8.477zM11.69 11h-3.41c-.266 0-.39-.175-.39-.517 0-.34.124-.516.39-.516h4.524c.22 0 .343.146.343.438v.922c0 .285-.098.397-.293.336L9.623 15h3.408c.267 0 .392.175.392.517 0 .34-.125.517-.392.517H8.51c-.22 0-.342-.146-.342-.438v-.921c0-.285.093-.396.289-.336L11.69 11zM16.5 15.1c0 .546-.356.9-.9.9h-1.2c-.544 0-.9-.356-.9-.9v-3.2c0-.544.356-.9.9-.9h1.2c.544 0 .9.356.9.9v3.2zM15.5 15v-3h-1v3h1z" />
				</svg>
				{ }
				<span className="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
					Chat với chúng tôi qua Zalo
				</span>
			</a>
		</div>
	);
};

export default ZaloChat;

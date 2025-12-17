
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
				<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 48 48">
					<path d="M24 4C13.5 4 5 11.9 5 21.7c0 6.1 3.4 11.5 8.5 14.8l-2.7 8.1 8.3-4.3c1.6.4 3.3.6 5 .6 10.5 0 19-7.9 19-17.7S34.5 4 24 4zm0 32c-1.6 0-3.1-.2-4.5-.6l-5.4 2.8 1.8-5.3C12.3 30.4 10 26.3 10 21.7 10 14.6 16.3 9 24 9s14 5.6 14 12.7-6.3 14.3-14 14.3z"/>
					<path d="M29.5 24.5h-4v-4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v4h-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h4v4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-4h4c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
				</svg>
				{}
				<span className="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
					Chat với chúng tôi qua Zalo
				</span>
			</a>
		</div>
	);
};

export default ZaloChat;

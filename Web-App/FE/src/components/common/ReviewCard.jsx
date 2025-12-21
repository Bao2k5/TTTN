const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-luxury-beige pb-6 last:border-0">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-full bg-luxury-sand flex items-center justify-center text-luxury-brown font-medium">
          {review.userName.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium text-luxury-charcoal">{review.userName}</h4>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400 text-sm">
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
            <span className="text-luxury-taupe text-sm">{review.date}</span>
          </div>
        </div>
      </div>
      <div className="text-luxury-brown leading-relaxed">
        {review.title && <h5 className="font-medium text-luxury-charcoal mb-1">{review.title}</h5>}
        <p>{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;

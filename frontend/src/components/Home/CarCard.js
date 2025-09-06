function CarCard({ car }) {
  const imageName = `${car.make.toLowerCase().replace(/\s+/g, "-")}-${car.model
    .toLowerCase()
    .replace(/\s+/g, "-")}.jpg`;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <>
        {"⭐".repeat(fullStars)}
        {halfStar ? "✩" : ""}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <li className="p-4 rounded-lg shadow border w-full flex flex-col gap-3 bg-white">
      <img
        src={`/images/${imageName}`}
        alt={`${car.make} ${car.model}`}
        className="w-full h-40 object-cover rounded"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/images/default.jpg";
        }}
      />
      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg text-gray-800">
          {car.make} {car.model} | ₱{car.pricePerDay}/day
        </span>
        <div className="text-gray-600">
          Avg Rating: {car.averageRating?.toFixed(1)} {renderStars(car.averageRating)}
        </div>
      </div>
    </li>
  );
}

export default CarCard;

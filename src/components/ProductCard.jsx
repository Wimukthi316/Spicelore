import React from "react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-6">
                <h3 className="text-xl font-bold text-[#351108] mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#351108]">${product.price}</span>
                    <button 
                        className="bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition-all cursor-pointer"
                        onClick={() => onAddToCart(product)}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

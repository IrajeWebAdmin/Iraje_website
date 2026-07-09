"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";
import products from "@/data/product";

export default function ProductCards() {
  const [activeCard, setActiveCard] = useState("epm");
  
  return (
    <section className="relative z-20 -mt-20 sm:-mt-32 md:-mt-48">
      {/* <div className="mx-auto max-w-7xl px-6 lg:px-12"> */}
      <div className="container-global">
        {/* Cards */}
      

     
        <div className="grid grid-cols-3 items-end gap-4 xl:gap-6">
          {products.map((product) => {
            const key = product.shortName.toLowerCase();
            return (
              <ProductCard
                key={product.id}
                {...product}
                active={activeCard === key}
                activeCard={activeCard}
                onMouseEnter={() => setActiveCard(key)}
              />
            );
          })}

        </div>

        {/* Section Title */}
     <h2 className="mt-16 text-center text-[clamp(1.75rem,1.4rem_+_1.6vw,2.25rem)] font-semibold text-[#0451CC]">
          Our Products
        </h2>

        {/* Divider */}
       <hr className="mt-16 w-full border-t-[3px] border-[#0451CC]" />
      </div>
    </section>
  );
}

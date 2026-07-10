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
            // shortName is "Iraje PAM/EPM/IAM" — strip the brand prefix so the
            // key is just "pam" | "epm" | "iam" and matches the default above.
            const key = product.shortName.replace(/^Iraje\s+/i, "").toLowerCase();
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
     <h2 className="mt-16 text-center epm-heading font-semibold text-[#0451CC]">
          Our Products
        </h2>

        {/* Divider */}
       <hr className="mt-16 w-full border-t-[1px] border-[#0451CC]/31" />
      </div>
    </section>
  );
}
